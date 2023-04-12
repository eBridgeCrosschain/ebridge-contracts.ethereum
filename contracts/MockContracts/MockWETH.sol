import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
pragma solidity 0.8.9;

contract WETH is ERC20 {
    constructor() ERC20('weth', 'WETH') {}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
