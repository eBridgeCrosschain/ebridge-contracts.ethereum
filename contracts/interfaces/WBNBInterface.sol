pragma solidity >=0.5.0;

interface IWBNB {
    function deposit() external payable;
    function withdraw(uint wad) external;
    function approve(address guy, uint wad) external returns (bool);
}