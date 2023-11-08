pragma solidity 0.8.9;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

library DailyLimiter {
    using SafeMath for uint256;

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
        require( (uint256)(_config.refreshTime).mod(DefaultRefreshTime) == 0,'Invalid refresh time.');
        if (_dailyLimitTokenInfo.refreshTime != 0 && (block.timestamp.sub(_dailyLimitTokenInfo.refreshTime)).div(DefaultRefreshTime) <= 0) {
            uint256 defaultTokenAmount = _dailyLimitTokenInfo.defaultTokenAmount;
            uint256 currentTokenAmount = _dailyLimitTokenInfo.tokenAmount;
            uint256 useAmount = defaultTokenAmount.sub(currentTokenAmount);
            if (_config.defaultTokenAmount.sub(useAmount) < 0){
                _dailyLimitTokenInfo.tokenAmount = 0;
            }else{
                _dailyLimitTokenInfo.tokenAmount = _config.defaultTokenAmount.sub(useAmount);
            }
        }else{
            _dailyLimitTokenInfo.tokenAmount = _config.defaultTokenAmount;
        }
        _dailyLimitTokenInfo.defaultTokenAmount = _config.defaultTokenAmount;
        _dailyLimitTokenInfo.refreshTime = _config.refreshTime;
        emit DailyLimitSet(_config);
    }

    function _consume(DailyLimitTokenInfo storage _dailyLimitTokenInfo, address _tokenAddress, uint256 _amount) internal {
        uint256 lastRefreshTime = _dailyLimitTokenInfo.refreshTime;
        uint256 count = (block.timestamp.sub(lastRefreshTime)).div(DefaultRefreshTime);
        if(count > 0){
            lastRefreshTime = lastRefreshTime.add((uint256)(DefaultRefreshTime).mul(count));
            _dailyLimitTokenInfo.refreshTime = uint32(lastRefreshTime);
            _dailyLimitTokenInfo.tokenAmount = _dailyLimitTokenInfo.defaultTokenAmount;
        }
        if (_amount > _dailyLimitTokenInfo.tokenAmount) {
            revert DailyLimitExceeded(_dailyLimitTokenInfo.tokenAmount,_amount);
        }
        _dailyLimitTokenInfo.tokenAmount =  _dailyLimitTokenInfo.tokenAmount.sub(_amount);
        emit TokenDailyLimitConsumed(_tokenAddress,_amount);
    }

}