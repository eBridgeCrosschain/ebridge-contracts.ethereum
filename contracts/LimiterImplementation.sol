pragma solidity 0.8.9;


import {RateLimiter} from "./libraries/RateLimiter.sol";
import {DailyLimit} from "./libraries/DailyLimit.sol";
import './libraries/BridgeInLibrary.sol';
import "./Proxy.sol";


contract Limiter is ProxyStorage {
    using DailyLimit for DailyLimit.DailyLimitTokenInfo;
    using RateLimiter for RateLimiter.TokenBucket;

    // key: tokenKey / swapId
    mapping(bytes32 => RateLimiter.TokenBucket) private tokenBucket;
    mapping(bytes32 => DailyLimit.DailyLimitTokenInfo) private dailyLimit;
    address public admin;
    address public bridgeIn;
    address public bridgeOut;

    modifier onlyAdmin () {
        require(msg.sender == admin, "no permission");
        _;
    }
    modifier onlyBridge () {
        require(msg.sender == bridgeIn || msg.sender == bridgeOut, "no permission");
        _;
    }

    function initialize(
        address _bridgeIn,
        address _bridgeOut,
        address _admin
    ) external onlyOwner {
        require(bridgeIn == address(0), "already initialized");
        bridgeIn = _bridgeIn;
        bridgeOut = _bridgeOut;
        admin = _admin;
    }

    function consumeDailyLimit(bytes32 dailyLimitId,address tokenAddress,uint256 amount) external onlyBridge {
        dailyLimit[dailyLimitId]._consume(tokenAddress,amount);
    } 
    function consumeTokenBucket(bytes32 bucketId,address tokenAddress,uint256 amount) external onlyBridge {
        tokenBucket[bucketId]._consume(tokenAddress,amount);
    } 

    function setDailyLimit(
        DailyLimit.DailyLimitConfig[] memory dailyLimitConfigs
    )external onlyAdmin {
        for (uint i = 0; i < dailyLimitConfigs.length; i++) {
            DailyLimit.DailyLimitConfig memory dailyLimitConfig = dailyLimitConfigs[i];
            dailyLimit[dailyLimitConfig.dailyLimitId]._setDailyLimit(dailyLimitConfig);
        }
    }

    function getReceiptDailyLimit(
        address _token, string memory _targetChainId
    ) public view returns (DailyLimit.DailyLimitTokenInfo memory){
        bytes32 dailyLimitId = BridgeInLibrary._generateTokenKey(_token,_targetChainId);
        return dailyLimit[dailyLimitId];
    }

    function getSwapDailyLimit(
        bytes32 swapId
    ) public view returns (DailyLimit.DailyLimitTokenInfo memory){
        return dailyLimit[swapId];
    }

    function SetTokenBucketConfig(RateLimiter.TokenBucketConfig[] memory configs) external onlyAdmin {
        for (uint i = 0; i < configs.length; i++) {
            RateLimiter.TokenBucketConfig memory config = configs[i];
            tokenBucket[config.bucketId]._configTokenBucket(configs[i]);
        }
    }

    function GetCurrentReceiptTokenBucketConfig(address _token, string memory _targetChainId) public view returns (RateLimiter.TokenBucket memory){
        bytes32 bucketId = BridgeInLibrary._generateTokenKey(_token,_targetChainId);
        return tokenBucket[bucketId]._currentTokenBucketState();       
    }

    function GetCurrentSwapTokenBucketConfig(bytes32 swapId) public view returns (RateLimiter.TokenBucket memory){
            return tokenBucket[swapId]._currentTokenBucketState();       
    }

    function GetReceiptBucketMinWaitSeconds(uint256 amount,address _token, string memory _targetChainId) public view returns (uint256){
        bytes32 bucketId = BridgeInLibrary._generateTokenKey(_token,_targetChainId);
        RateLimiter.TokenBucket memory bucket = tokenBucket[bucketId]._currentTokenBucketState();
        if (amount > bucket.currentTokenAmount) {
            return ((amount - bucket.currentTokenAmount) + (bucket.rate - 1)) / bucket.rate;
        }else{
            return 0;
        }
    }
    
    function GetSwapBucketMinWaitSeconds(uint256 amount,bytes32 swapId) public view returns (uint256){
        RateLimiter.TokenBucket memory bucket = tokenBucket[swapId]._currentTokenBucketState();
        if (amount > bucket.currentTokenAmount) {
            return ((amount - bucket.currentTokenAmount) + (bucket.rate - 1)) / bucket.rate;
        }else{
            return 0;
        }
    }
}