pragma solidity 0.8.9;

import {RateLimiter} from "../libraries/RateLimiter.sol";
import {DailyLimit} from "../libraries/DailyLimit.sol";

interface ILimiter {
    function consumeDailyLimit(bytes32 dailyLimitId,address tokenAddress,uint256 amount) external;
    function consumeTokenBucket(bytes32 bucketId,address tokenAddress,uint256 amount) external;
    function setDailyLimit(
        DailyLimit.DailyLimitConfig[] memory dailyLimitConfigs
    )external;
    function SetTokenBucketConfig(RateLimiter.TokenBucketConfig[] memory configs) external;

}