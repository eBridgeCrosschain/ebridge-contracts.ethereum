pragma solidity 0.8.9;

library DailyLimit {
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
        _dailyLimitTokenInfo.defaultTokenAmount = _config.defaultTokenAmount;
        _dailyLimitTokenInfo.tokenAmount = _config.defaultTokenAmount;
        require( _config.refreshTime % DefaultRefreshTime == 0,'Invalid refresh time.');
        _dailyLimitTokenInfo.refreshTime = _config.refreshTime;
        emit DailyLimitSet(_config);
    }

    function _consume(DailyLimitTokenInfo storage _dailyLimitTokenInfo, address _tokenAddress, uint256 _amount) internal {
        uint256 lastRefreshTime = _dailyLimitTokenInfo.refreshTime;
        uint256 count = (lastRefreshTime - block.timestamp) / DefaultRefreshTime ;
        if(count > 0){
            lastRefreshTime += DefaultRefreshTime * count;
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