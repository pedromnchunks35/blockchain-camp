// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../node_modules/hardhat/console.sol";

contract Token {
    /* STATE VARIABLES (PERMANENT STORED IN THE CONSTRACT)*/
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    /* 1,000,000 x 10^18 */
    uint256 public totalSupply;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);
    }
}
