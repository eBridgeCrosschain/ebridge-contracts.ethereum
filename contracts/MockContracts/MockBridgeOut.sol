pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '../interfaces/LimiterInterface.sol';
import '../libraries/CommonLibrary.sol';

contract MockBridgeOut {
    using SafeERC20 for IERC20;
    bool isPaused = false;
    mapping(bytes32 => bytes32) internal tokenKeyToSwapIdMap;
    mapping(bytes32 => uint256) public tokenDepositAmount;
    address public oracleContract;
    mapping(uint32 => CommonLibrary.CrossChainConfig) private crossChainConfigMap;

    function pause() external {
        isPaused = true;
    }

    function restart() external {}

    function withdraw(bytes32 tokenKey, address token, uint256 amount) external {
        require(!isPaused, 'BridgeOut:paused');
        IERC20(token).safeTransfer(address(msg.sender), amount);
    }

    function createSwap(address token, string memory fromChainId) external returns (bytes32) {
        bytes32 tokenKey = sha256(abi.encodePacked(token, fromChainId));
        bytes32 swapId = keccak256(msg.data);
        tokenKeyToSwapIdMap[tokenKey] = swapId;
        return swapId;
    }

    function getSwapId(address token, string memory fromChainId) external view returns (bytes32) {
        bytes32 tokenKey = sha256(abi.encodePacked(token, fromChainId));
        return tokenKeyToSwapIdMap[tokenKey];
    }

    function consumeLimit(address limiter, bytes32 id, address token, uint256 amount) external {
        ILimiter(limiter).consumeTokenBucket(id, token, amount);
    }

    function deposit(bytes32 tokenKey, address token, uint256 amount) external {
        bytes32 swapId = tokenKeyToSwapIdMap[tokenKey];
        IERC20(token).safeTransferFrom(address(msg.sender), address(this), amount);
        tokenDepositAmount[swapId] = tokenDepositAmount[swapId] + amount;
    }

    function setCrossChainConfig(CommonLibrary.CrossChainConfig[] calldata _configs, address _oracleContract) external {
        oracleContract = _oracleContract;
        require(_configs.length > 0, "invalid input");
        for (uint i = 0; i < _configs.length; i++) {
            crossChainConfigMap[_configs[i].chainId] = CommonLibrary.CrossChainConfig(
                _configs[i].bridgeContractAddress,
                _configs[i].targetChainId,
                _configs[i].chainId
            );
        }
    }

    function getCrossChainConfig(uint32 chainId) public view returns (CommonLibrary.CrossChainConfig memory) {
        return crossChainConfigMap[chainId];
    }

}
