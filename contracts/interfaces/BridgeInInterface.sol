pragma solidity >=0.5.0;

interface IBridgeIn {
    function isSupported(
        address token,
        string calldata chainId
    ) external view returns (bool);
}
