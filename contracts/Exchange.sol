// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../node_modules/hardhat/console.sol";
import "./Token.sol";

contract Exchange {
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

    //? CREATE THE MAPPING TO TRACK WHICH TOKENS THE USER DEPOSIT, it takes the user address, the address of the token and the amount of tokens he deposited once uppon the time
    mapping(address => mapping(address => uint256)) public tokens;

    //? CONSTRUCT FUNCTION, THIS WILL INITIATE THE CONTRACT
    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //! EVENTS
    event Deposit(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );
    event Withdraw(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );

    //? DEPOSIT TOKEN
    //* @param _token, address of the token we want to deposit
    //* @param _amount, the amount of tokens we want to deposit
    //* @returns Success or Revert
    //* @notes, address(this) is how we get the address of this smart contract
    function depositToken(address _token, uint256 _amount) public {
        // TODO Transfer tokens to exchange smart contract (YES WE CAN USE THE REQUIRE WITH A OPERATION FOR CASE IT FAILS WE GIVE A CERTAIN REASON)
        Token(_token).transferFrom(msg.sender, address(this), _amount);

        // TODO Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // TODO Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //? CHECK BALANCES
    //* @param _token, which is the address of the token that we want to check the balance
    //* param _user, the address of the user that once deposited a certain amount
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    //? WITHDRAW TOKENS
    //* @param _token, the address of the token we want to withdraw
    //* @param _amount, the amount of tokens we want to withdraw
    //* @returns Success or Revert
    function withdrawToken(address _token, uint256 _amount) public {
        //TODO Balance verification
        require(
            balanceOf(_token, msg.sender) >= _amount,
            "You don't have enought balance of that token to withdraw"
        );
        // TODO Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
        // TODO Transfer token to the user
        Token(_token).transfer(msg.sender, _amount);
        // TODO Emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
}
