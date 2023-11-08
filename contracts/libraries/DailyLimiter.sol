pragma solidity 0.8.9;
import 'hardhat/console.sol';

library DailyLimiter {
    error DailyLimitExceeded(uint256 dailyLimit, uint256 amount);
    event DailyLimitSet (DailyLimitConfig config);
    event TokenDailyLimitConsumed(address tokenAddress, uint256 tokens);


    struct DailyLimitTokenInfo {
        uint256 tokenAmount;
        uint32 refreshTime;
        uint256 defaultTokenAmount;
    }

    struct DailyLimitConfig{
        bytes32 dailyLimitId; //tokenKey/swapId
        uint32 refreshTime;
        uint256 defaultTokenAmount;
    }

    uint32 constant DefaultRefreshTime = 86400;

    function _setDailyLimit(DailyLimitTokenInfo storage _dailyLimitTokenInfo, DailyLimitConfig memory _config) internal {
        require( _config.refreshTime % DefaultRefreshTime == 0,'Invalid refresh time.');
        console.log(block.timestamp);
        console.log(_dailyLimitTokenInfo.refreshTime);
        if (_dailyLimitTokenInfo.refreshTime != 0 && (block.timestamp - _dailyLimitTokenInfo.refreshTime) / DefaultRefreshTime <= 0) {
            console.log("reset daily limit");
            uint256 defaultTokenAmount = _dailyLimitTokenInfo.defaultTokenAmount;
            uint256 currentTokenAmount = _dailyLimitTokenInfo.tokenAmount;
            uint256 useAmount = defaultTokenAmount - currentTokenAmount;
            if (_config.defaultTokenAmount - useAmount < 0){
                _dailyLimitTokenInfo.tokenAmount = 0;
            }else{
                _dailyLimitTokenInfo.tokenAmount = _config.defaultTokenAmount - useAmount;
            }
        }else{
            _dailyLimitTokenInfo.tokenAmount = _config.defaultTokenAmount;
        }
        _dailyLimitTokenInfo.defaultTokenAmount = _config.defaultTokenAmount;
        _dailyLimitTokenInfo.refreshTime = _config.refreshTime;
        emit DailyLimitSet(_config);
    }

    function _consume(DailyLimitTokenInfo storage _dailyLimitTokenInfo, address _tokenAddress, uint256 _amount) internal {
        console.log("consume");
        console.log(_dailyLimitTokenInfo.refreshTime);
        console.log(block.timestamp);
        uint256 lastRefreshTime = _dailyLimitTokenInfo.refreshTime;
        uint256 count = (block.timestamp - lastRefreshTime) / DefaultRefreshTime ;
        if(count > 0){
            console.log("refresh");
            console.log(count);
            lastRefreshTime += DefaultRefreshTime * count;
            console.log(lastRefreshTime);
            _dailyLimitTokenInfo.refreshTime = uint32(lastRefreshTime);
            _dailyLimitTokenInfo.tokenAmount = _dailyLimitTokenInfo.defaultTokenAmount;
        }
        if (_amount > _dailyLimitTokenInfo.tokenAmount) {
            revert DailyLimitExceeded(_dailyLimitTokenInfo.tokenAmount,_amount);
        }
        _dailyLimitTokenInfo.tokenAmount -= _amount;
        emit TokenDailyLimitConsumed(_tokenAddress,_amount);
    }

}