// SPDX-License-Identifier: MIT
import "./interfaces/MerkleTreeInterface.sol";
import "./interfaces/RegimentInterface.sol";
import "./interfaces/NativeTokenInterface.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./Proxy.sol";
import "./interfaces/LimiterInterface.sol";
import {BridgeOutLibrary} from "./libraries/BridgeOutLibrary.sol";
import {StringHex} from "./libraries/StringHex.sol";
import "./interfaces/TokenPoolInterface.sol";
import "./interfaces/RampInterface.sol";

pragma solidity 0.8.9;

contract BridgeOutImplementationV1 is ProxyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using BridgeOutLibrary for BridgeOutLibrary.Report;
    using BridgeOutLibrary for BridgeOutLibrary.ChainMapping;
    using StringHex for bytes32;

    address private merkleTree;
    address public regiment;
    address public bridgeIn;
    uint256 public defaultMerkleTreeDepth = 3;
    uint256 public constant MaxQueryRange = 100;
    uint256 public constant MaxTokenKeyCount = 200;
    bool public isPaused;
    address public tokenAddress;
    address public approveController;
    address public multiSigWallet;
    EnumerableSet.Bytes32Set private targetTokenList;

    mapping(bytes32 => SwapInfo) internal swapInfos;
    mapping(bytes32 => bytes32) internal tokenKeyToSwapIdMap;
    mapping(bytes32 => SwapAmounts) internal ledger;
    mapping(bytes32 => mapping(uint256 => ReceivedReceipt))
        internal receivedReceiptsMap;
    mapping(bytes32 => uint256) internal receivedReceiptIndex;
    mapping(string => bool) internal receiptApproveMap;
    mapping(address => uint256) public tokenAmountLimit;
    mapping(bytes32 => uint256) internal tokenDepositAmount;
    address public limiter;
    uint8 public signatureThreshold;
    address public tokenPool;

    address public oracleContract;

    struct ReceivedReceipt {
        address asset; // ERC20 Token Address
        address targetAddress; // User address in eth
        uint256 amount; // Locking amount
        uint256 blockHeight;
        uint256 blockTime;
        string fromChainId;
        string receiptId;
    }
    struct SwapTargetToken {
        address token;
        string fromChainId;
        uint64 originShare;
        uint64 targetShare;
    }
    struct SwapInfo {
        bytes32 swapId;
        bytes32 regimentId;
        bytes32 spaceId;
        SwapTargetToken targetToken;
    }
    struct SwapAmounts {
        address receiver;
        uint256 leafNodeIndex;
        mapping(address => uint256) receivedAmounts;
    }

    event SwapPairAdded(bytes32 swapId, address token, string chainId);
    event TokenSwapEvent(address receiveAddress, address token, uint256 amount);
    event NewTransmission(
        bytes32 swapId,
        address transmiter,
        string receiptId,
        bytes32 receiptHash
    );

    modifier onlyBridgeInContract() {
        require(msg.sender == bridgeIn, "no permission");
        _;
    }
    modifier onlyOracle() {
        require(msg.sender == oracleContract, "no permission");
        _;
    }
    modifier onlyWallet() {
        require(msg.sender == multiSigWallet, "BridgeOut:only for Wallet call");
        _;
    }
    modifier whenNotPaused() {
        require(!isPaused, "BridgeOut:paused");
        _;
    }

    function initialize(
        address _merkleTree,
        address _regiment,
        address _bridgeIn,
        address _tokenAddress,
        address _approveController,
        address _multiSigWallet
    ) external onlyOwner {
        require(merkleTree == address(0), "already initialized");
        merkleTree = _merkleTree;
        regiment = _regiment;
        bridgeIn = _bridgeIn;
        tokenAddress = _tokenAddress;
        approveController = _approveController;
        multiSigWallet = _multiSigWallet;
    }

    function pause() external onlyBridgeInContract {
        isPaused = true;
    }

    function restart() public onlyBridgeInContract {
        isPaused = false;
    }

    function setDefaultMerkleTreeDepth(
        uint256 _defaultMerkleTreeDepth
    ) external onlyWallet {
        require(
            _defaultMerkleTreeDepth > 0 && _defaultMerkleTreeDepth <= 20,
            "invalid input"
        );
        defaultMerkleTreeDepth = _defaultMerkleTreeDepth;
    }

    function setTokenPool(address _tokenPool) external onlyWallet {
        require(
            tokenPool == address(0) && _tokenPool != address(0),
            "invalid token pool address"
        );
        tokenPool = _tokenPool;
    }

    function setLimiter(address _limiter) external onlyWallet {
        require(
            limiter == address(0) && _limiter != address(0),
            "invalid limiter address"
        );
        limiter = _limiter;
    }

    function changeMultiSignWallet(address _multiSigWallet) external onlyOwner {
        require(_multiSigWallet != address(0), "invalid input");
        multiSigWallet = _multiSigWallet;
    }

    //Swap
    function createSwap(
        SwapTargetToken calldata targetToken,
        bytes32 regimentId
    ) external {
        require(
            IRegiment(regiment).IsRegimentManager(regimentId, msg.sender),
            "no permission"
        );
        require(targetToken.token != address(0), "invalid input");
        require(
            targetTokenList.length() < MaxTokenKeyCount,
            "token list exceed"
        );
        bytes32 tokenKey = _getTokenKey(
            targetToken.token,
            targetToken.fromChainId
        );
        BridgeOutLibrary.checkTokenNotExist(targetTokenList, tokenKey);
        require(
            targetToken.originShare > 0 && targetToken.targetShare > 0,
            "invalid swap ratio"
        );
        bytes32 spaceId = IMerkleTree(merkleTree).createSpace(
            regimentId,
            defaultMerkleTreeDepth
        );
        bytes32 swapId = keccak256(msg.data);
        swapInfos[swapId] = SwapInfo(swapId, regimentId, spaceId, targetToken);
        targetTokenList.add(tokenKey);
        tokenKeyToSwapIdMap[tokenKey] = swapId;

        emit SwapPairAdded(swapId, targetToken.token, targetToken.fromChainId);
    }

    function deposit(bytes32 tokenKey, address token, uint256 amount) external {
        bytes32 swapId = tokenKeyToSwapIdMap[tokenKey];
        BridgeOutLibrary.validateToken(
            targetTokenList,
            token,
            tokenKey,
            swapInfos[swapId].targetToken.token
        );
        IERC20(token).safeTransferFrom(
            address(msg.sender),
            address(this),
            amount
        );
        tokenDepositAmount[swapId] += amount;
    }

    function setCrossChainConfig(
        BridgeOutLibrary.CrossChainConfig calldata config
    ) external {
        oracleContract = config.oracleContract;
        // chainMapping.updateConfig(config);
    }

    function forwardMessage(
        uint256 sourceChainId,
        uint256 targetChainId,
        string calldata sender,
        string calldata receiver,
        bytes calldata message,
        IRamp.TokenAmount calldata tokenAmount
    ) external whenNotPaused onlyOracle {
        // require(tokenAmount.amount > 0, "Invalid amount");
        require(targetChainId == block.chainid, "Invalid target chainId");

        BridgeOutLibrary.ReceiptInfo memory receiptInfo = BridgeOutLibrary
            .decodeReportAndVerifyReceipt(message);
        require(
            ledger[receiptInfo.receiptHash].leafNodeIndex == 0,
            "Already recorded"
        );
        ledger[receiptInfo.receiptHash].leafNodeIndex = 1;
        bytes32 swapId = BridgeOutLibrary.stringToBytes32(tokenAmount.swapId);
        SwapInfo storage swapInfo = swapInfos[swapId];
        _completeReceipt(receiptInfo, swapInfo);

        emit NewTransmission(
            swapId,
            msg.sender,
            receiptInfo.receiptId,
            receiptInfo.receiptHash
        );
    }

    function _checkParams(
        bytes32 swapId
    ) internal view returns (SwapInfo storage) {
        require(!isPaused, "BridgeOut:paused");
        SwapInfo storage swapInfo = swapInfos[swapId];
        require(swapInfo.regimentId != bytes32(0), "swap pair not found");
        return swapInfo;
    }

    function _completeReceipt(
        BridgeOutLibrary.ReceiptInfo memory receiptInfo,
        SwapInfo memory swapInfo
    ) internal {
        uint256 targetTokenAmount = BridgeOutLibrary.calculateTargetTokenAmount(
            BridgeOutLibrary.SwapCalculationParams(
                receiptInfo.amount,
                swapInfo.targetToken.targetShare,
                swapInfo.targetToken.originShare
            )
        );
        bytes32 receiptHash = receiptInfo.receiptHash;
        SwapAmounts storage swapAmounts = ledger[receiptHash];
        BridgeOutLibrary.validateReceiver(
            receiptInfo.receiveAddress,
            swapAmounts.receiver
        );
        swapAmounts.receiver = receiptInfo.receiveAddress;
        address token = swapInfo.targetToken.token;
        ILimiter(limiter).consumeDailyLimit(
            swapInfo.swapId,
            token,
            targetTokenAmount
        );
        ILimiter(limiter).consumeTokenBucket(
            swapInfo.swapId,
            token,
            targetTokenAmount
        );
        if (tokenPool == address(0)) {
            require(
                targetTokenAmount <= tokenDepositAmount[swapInfo.swapId],
                "deposit not enough"
            );
            tokenDepositAmount[swapInfo.swapId] =
                tokenDepositAmount[swapInfo.swapId] -
                targetTokenAmount;
            if (token == tokenAddress) {
                INativeToken(tokenAddress).withdraw(targetTokenAmount);
                (bool success, ) = payable(receiptInfo.receiveAddress).call{
                    value: targetTokenAmount
                }("");
                require(success, "transfer failed");
            } else {
                IERC20(token).safeTransfer(
                    receiptInfo.receiveAddress,
                    targetTokenAmount
                );
            }
        } else {
            ITokenPool(tokenPool).release(
                token,
                targetTokenAmount,
                swapInfo.targetToken.fromChainId,
                receiptInfo.receiveAddress
            );
        }
        emit TokenSwapEvent(
            receiptInfo.receiveAddress,
            token,
            targetTokenAmount
        );
        swapAmounts.receivedAmounts[token] = targetTokenAmount;
        bytes32 tokenKey = _getTokenKey(
            token,
            swapInfo.targetToken.fromChainId
        );
        receivedReceiptIndex[tokenKey] = receivedReceiptIndex[tokenKey] + 1;
        receivedReceiptsMap[tokenKey][
            receivedReceiptIndex[tokenKey]
        ] = ReceivedReceipt(
            token,
            receiptInfo.receiveAddress,
            receiptInfo.amount,
            block.number,
            block.timestamp,
            swapInfo.targetToken.fromChainId,
            receiptInfo.receiptId
        );
    }

    function _getTokenKey(
        address token,
        string memory fromChainId
    ) internal pure returns (bytes32) {
        return sha256(abi.encodePacked(token, fromChainId));
    }

    function isReceiptRecorded(bytes32 receiptHash) public view returns (bool) {
        return ledger[receiptHash].leafNodeIndex > 0;
    }

    function getReceiveReceiptIndex(
        address[] memory tokens,
        string[] calldata fromChainIds
    ) external view returns (uint256[] memory) {
        require(tokens.length == fromChainIds.length, "invalid input");

        uint256 length = tokens.length;
        uint256[] memory indexes = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            indexes[i] = receivedReceiptIndex[
                _getTokenKey(tokens[i], fromChainIds[i])
            ];
        }

        return indexes;
    }

    function getSwapId(
        address token,
        string calldata fromChainId
    ) public view returns (bytes32) {
        bytes32 tokenKey = _getTokenKey(token, fromChainId);
        return tokenKeyToSwapIdMap[tokenKey];
    }

    function getReceivedReceiptInfos(
        address token,
        string calldata fromChainId,
        uint256 fromIndex,
        uint256 endIndex
    ) public view returns (ReceivedReceipt[] memory _receipts) {
        bytes32 tokenKey = _getTokenKey(token, fromChainId);
        require(
            endIndex <= receivedReceiptIndex[tokenKey] && fromIndex > 0,
            "Invalid input"
        );

        uint256 length = endIndex - fromIndex + 1;
        require(length <= MaxQueryRange, "Query range is exceeded");
        _receipts = new ReceivedReceipt[](length);
        for (uint256 i = 0; i < length; i++) {
            _receipts[i] = receivedReceiptsMap[tokenKey][fromIndex + i];
        }

        return _receipts;
    }

    function getSwapInfo(
        bytes32 swapId
    )
        external
        view
        returns (
            string memory fromChainId,
            bytes32 regimentId,
            bytes32 spaceId,
            address token
        )
    {
        SwapInfo storage info = swapInfos[swapId];
        return (
            info.targetToken.fromChainId,
            info.regimentId,
            info.spaceId,
            info.targetToken.token
        );
    }

    // function assetsMigrator(
    //     bytes32 tokenKey,
    //     address token
    // ) external onlyBridgeInContract {
    //     bytes32 swapId = tokenKeyToSwapIdMap[tokenKey];
    //     BridgeOutLibrary.validateToken(
    //         targetTokenList,
    //         token,
    //         tokenKey,
    //         swapInfos[swapId].targetToken.token
    //     );

    //     uint256 balance = IERC20(token).balanceOf(address(this));
    //     if (balance > 0) {
    //         IERC20(token).safeTransfer(address(tokenPool), balance);
    //     }

    //     delete tokenDepositAmount[swapId];
    // }
}
