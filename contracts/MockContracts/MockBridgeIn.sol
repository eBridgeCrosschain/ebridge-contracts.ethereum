pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/NativeTokenInterface.sol";
import "../interfaces/BridgeOutInterface.sol";
import "../interfaces/LimiterInterface.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/TokenPoolInterface.sol";


contract MockBridgeIn {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using SafeMath for uint256;

    EnumerableSet.Bytes32Set private tokenList;

    struct Token {
        address tokenAddress;
        string chainId;
    }

    function depositToBridgeOut(
        address _tokenAddress,
        address _bridgeOut,
        string memory _chainId
    ) external payable {
        require(msg.value > 0, "balance is not enough.");
        INativeToken(_tokenAddress).deposit{value: msg.value}();
        bool success = INativeToken(_tokenAddress).approve(
            _bridgeOut,
            msg.value
        );
        require(success, "failed.");
        bytes32 tokenKey = sha256(abi.encodePacked(_tokenAddress, _chainId));
        IBridgeOut(_bridgeOut).deposit(tokenKey, _tokenAddress, msg.value);
    }

    function restart(address _bridgeOut) external {
        IBridgeOut(_bridgeOut).restart();
    }

    function pause(address _bridgeOut) external {
        IBridgeOut(_bridgeOut).pause();
    }

    function withdraw(
        address _bridgeOut,
        bytes32 tokenKey,
        address token,
        uint256 amount
    ) external {
        IBridgeOut(_bridgeOut).withdraw(tokenKey, token, amount);
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    function consumeLimit(address limiter,bytes32 id,address token,uint256 amount) external {
        ILimiter(limiter).consumeDailyLimit(id,token,amount);
    }

    function addToken(Token[] calldata tokens) public {
        require(
            tokenList.length().add(tokens.length) <= 100 && tokens.length <= 10,
            "token count exceed"
        );
        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 tokenKey = sha256(abi.encodePacked(tokens[i].tokenAddress, tokens[i].chainId));
            require(!tokenList.contains(tokenKey), "tokenKey already added");
            tokenList.add(tokenKey);
        }
    }

    function isSupported(
        address token,
        string calldata chainId
    ) public view returns (bool) {
        bytes32 tokenKey = sha256(abi.encodePacked(token, chainId));
        return tokenList.contains(tokenKey);
    }

    function lock(address token,uint256 amount,string calldata targetChainId,address tokenPool) external payable{
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(token).safeApprove(tokenPool, amount);
        ITokenPool(tokenPool).lock(token,amount,targetChainId,msg.sender);
    }

    function setCrossChainConfig(address _bridgeOut,CommonLibrary.CrossChainConfig[] calldata _configs, address _oracleContract) external {
        IBridgeOut(_bridgeOut).setCrossChainConfig(_configs, _oracleContract);
    }
    
}
