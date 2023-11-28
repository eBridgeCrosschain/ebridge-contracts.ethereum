pragma solidity 0.8.9;
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

library DailyLimiter {
    using SafeMath for uint256;

    error InvalidRefreshTime();
    error DailyLimitExceeded(uint256 remainingTokenAmount, uint256 requestedAmount);
    event DailyLimitSet(DailyLimitConfig config);
    event TokenDailyLimitConsumed(address tokenAddress, uint256 amount);

    struct DailyLimitTokenInfo {
        uint256 remainingTokenAmount;
        uint32 lastRefreshTime;
        uint256 dailyLimit;
    }

    struct DailyLimitConfig {
        bytes32 dailyLimitId;
        uint32 refreshTime;
        uint256 dailyLimit;
    }

    uint32 constant SecondsInADay = 86400;

    function _setDailyLimit(
        DailyLimitTokenInfo storage _dailyLimitTokenInfo,
        DailyLimitConfig memory _config
    ) internal {
        if ((_config.refreshTime % SecondsInADay) != 0) {
            revert InvalidRefreshTime();
        }

        if (
            block.timestamp < _config.refreshTime ||
            (block.timestamp - _config.refreshTime) > SecondsInADay
        ) {
            revert InvalidRefreshTime();
        }

        if (_withinRefreshInterval(_dailyLimitTokenInfo)) {
            uint256 unusedTokenAmount = _calculateUnusedTokenAmount(_dailyLimitTokenInfo);
            _dailyLimitTokenInfo.remainingTokenAmount = (_config.dailyLimit <= unusedTokenAmount)
                ? 0
                : _config.dailyLimit - unusedTokenAmount;
        } else {
            _dailyLimitTokenInfo.remainingTokenAmount = _config.dailyLimit;
        }

        _dailyLimitTokenInfo.dailyLimit = _config.dailyLimit;
        _dailyLimitTokenInfo.lastRefreshTime = _config.refreshTime;
        emit DailyLimitSet(_config);
    }

    function _consume(
        DailyLimitTokenInfo storage _dailyLimitTokenInfo,
        address _tokenAddress,
        uint256 _amount
    ) internal {
        (uint32 refreshTime, uint256 remainingTokenAmount) = _refreshRemainingTokenAmount(
            _dailyLimitTokenInfo.lastRefreshTime,
            _dailyLimitTokenInfo.remainingTokenAmount,
            _dailyLimitTokenInfo.dailyLimit
        );

        _dailyLimitTokenInfo.lastRefreshTime = refreshTime;

        if (_amount > remainingTokenAmount) {
            revert DailyLimitExceeded(remainingTokenAmount, _amount);
        }

        _dailyLimitTokenInfo.remainingTokenAmount = remainingTokenAmount - _amount;
        emit TokenDailyLimitConsumed(_tokenAddress, _amount);
    }

    function _currentDailyLimit(
        DailyLimitTokenInfo memory _dailyLimitTokenInfo
    ) internal view returns (DailyLimitTokenInfo memory) {
        (uint32 refreshTime, uint256 remainingTokenAmount) = _refreshRemainingTokenAmount(
            _dailyLimitTokenInfo.lastRefreshTime,
            _dailyLimitTokenInfo.remainingTokenAmount,
            _dailyLimitTokenInfo.dailyLimit
        );

        _dailyLimitTokenInfo.lastRefreshTime = refreshTime;
        _dailyLimitTokenInfo.remainingTokenAmount = remainingTokenAmount;
        return _dailyLimitTokenInfo;
    }

    function _refreshRemainingTokenAmount(
        uint256 _lastRefreshTime,
        uint256 _remainingTokenAmount,
        uint256 _dailyLimit
    ) private view returns (uint32 lastRefreshTime, uint256 remainingTokenAmount) {
        uint256 elapsedTimeInDays = (block.timestamp - _lastRefreshTime) / SecondsInADay;
        lastRefreshTime = uint32(_lastRefreshTime);
        remainingTokenAmount = _remainingTokenAmount;

        if (elapsedTimeInDays > 0) {
            lastRefreshTime = uint32(_lastRefreshTime + (SecondsInADay * elapsedTimeInDays));
            remainingTokenAmount = _dailyLimit;
        }

        return (lastRefreshTime, remainingTokenAmount);
    }

    function _withinRefreshInterval(DailyLimitTokenInfo storage _dailyLimitTokenInfo) private view returns (bool) {
        return (_dailyLimitTokenInfo.lastRefreshTime != 0 &&
                (block.timestamp - _dailyLimitTokenInfo.lastRefreshTime) / SecondsInADay < 1);
    }

    function _calculateUnusedTokenAmount(DailyLimitTokenInfo storage _dailyLimitTokenInfo) private view returns (uint256) {
        uint256 dailyLimit = _dailyLimitTokenInfo.dailyLimit;
        uint256 currentTokenAmount = _dailyLimitTokenInfo.remainingTokenAmount;
        return dailyLimit > currentTokenAmount ? dailyLimit - currentTokenAmount : 0;
    }
}
