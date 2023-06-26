// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../node_modules/hardhat/console.sol";
contract Exchange{
//? EXCHANGE FUNCTIONS
//* Deposit tokens
//* Withdrawl tokens
//* Check balances
//* Make orders
//* Cancel orders
//* Fill Orders
//* Charge Fees
//* Track Fee Account
    
    //? ACCOUNT THAT WILL RECEIVE THE FEE FROM THE EXCHANGE OF TOKENS
    address public feeAccount;
    //? THE PERCENTAGE THAT WE WILL CHARGE TO TRADE TOKENS
    uint256 public feePercent;

    constructor(address _feeAccount, uint256 _feePercent){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
}