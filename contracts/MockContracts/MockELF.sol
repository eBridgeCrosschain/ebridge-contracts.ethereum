import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
pragma solidity 0.8.9;

contract ELF is ERC20 {
    constructor() ERC20("elf", "ELF") {}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}
