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

    //? The current last id of the order
    uint256 public orderCount = 0;

    //? CREATE THE MAPPING TO TRACK WHICH TOKENS THE USER DEPOSIT, it takes the user address, the address of the token and the amount of tokens he deposited once uppon the time
    mapping(address => mapping(address => uint256)) public tokens;

    //? MAPPING OF THE ORDERS
    mapping(uint256 => Order) public orders;

    //? Mapping to know if a order is canceled
    mapping(uint256 => bool) public canceledOrders;

    //? Mapping to know if a order is canceled
    mapping(uint256 => bool) public filledOrders;

    //? CONSTRUCT FUNCTION, THIS WILL INITIATE THE CONTRACT
    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //! STRUCTS
    struct Order {
        uint256 _id; //? The id of the order
        address _user; //? User who made the order
        address _tokenGet; //? The token that the user whishes
        address _tokenGive; //? The token that the user wants to give over
        uint256 _amountGet; //? The amount of tokenGet the user wishes to get
        uint256 _amountGive; //? The amount of tokenGive the user wishes to give over
        uint256 _timestamp; //? Timestamp of the order
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
    event OrderEvent(
        uint256 _id,
        address _user,
        address _tokenGet,
        address _tokenGive,
        uint256 _amountGet,
        uint256 _amountGive,
        uint256 _timestamp
    );
    event CancelEvent(
        uint256 _id,
        address _user,
        address _tokenGet,
        address _tokenGive,
        uint256 _amountGet,
        uint256 _amountGive,
        uint256 _timestamp
    );
    event Trade(
        uint256 _id,
        address _user,
        address _tokenGet,
        address _tokenGive,
        uint256 _amountGet,
        uint256 _amountGive,
        address _creator,
        uint256 _timestamp
    );

    //? DEPOSIT TOKEN
    /// @param _token, address of the token we want to deposit
    /// @param _amount, the amount of tokens we want to deposit
    //* @returns Success or Revert
    //* @note, address(this) is how we get the address of this smart contract
    function depositToken(address _token, uint256 _amount) public {
        // TODO Transfer tokens to exchange smart contract (YES WE CAN USE THE REQUIRE WITH A OPERATION FOR CASE IT FAILS WE GIVE A CERTAIN REASON)
        Token(_token).transferFrom(msg.sender, address(this), _amount);

        // TODO Update user balance
        tokens[_token][msg.sender] += _amount;

        // TODO Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //? CHECK BALANCES
    /// @param _token, which is the address of the token that we want to check the balance
    /// @param _user, the address of the user that once deposited a certain amount
    //* @returns Success
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    //? WITHDRAW TOKENS
    /// @param _token, the address of the token we want to withdraw
    /// @param _amount, the amount of tokens we want to withdraw
    //* @returns Success or Revert
    function withdrawToken(address _token, uint256 _amount) public {
        //TODO Balance verification
        require(
            balanceOf(_token, msg.sender) >= _amount,
            "You don't have enought balance of that token to withdraw"
        );
        // TODO Update user balance
        tokens[_token][msg.sender] -= _amount;
        // TODO Transfer token to the user
        Token(_token).transfer(msg.sender, _amount);
        // TODO Emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //? MAKE A ORDERER FUNCTION
    /// @param _tokenGet, the token we wish to have back
    /// @param _tokenGive, the token we wish to dispose over another
    /// @param _amountGet, the amount we wish to have back
    /// @param _amountGive, the amount we wish to dispose over another amount of tokens
    //* @returns Success or Revert
    //* @note The "block.timestamp" gets the "Unix epoch time" of a block, which is the number of secounds since 1970 january. It is a way to represent dates
    function makeOrder(
        address _tokenGet,
        address _tokenGive,
        uint256 _amountGet,
        uint256 _amountGive
    ) public {
        // TODO Check if the user has balance
        require(
            balanceOf(_tokenGive, msg.sender) >= _amountGive,
            "You don't have enought balance to give"
        );
        // TODO Increment id
        orderCount = orderCount + 1;
        // TODO Create the order
        orders[orderCount] = Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _tokenGive,
            _amountGet,
            _amountGive,
            block.timestamp
        );
        // TODO Emit event of order creation
        emit OrderEvent(
            orderCount,
            msg.sender,
            _tokenGet,
            _tokenGive,
            _amountGet,
            _amountGive,
            block.timestamp
        );
    }

    //? Function to cancel orders
    /// @param _id, the id of the order
    //* @returns Success or Revert
    function cancelOrder(uint256 _id) public {
        // TODO Fetch order
        Order storage _order = orders[_id];

        // TODO Check if the item exists
        require(_order._id == _id, "The given id does not exists");

        // TODO Make a obligation the cancel only gets canceled by the owner
        require(
            address(_order._user) == msg.sender,
            "You need to be the owner to cancel a order"
        );

        // TODO Cancel the order
        canceledOrders[_id] = true;

        // TODO Emit event
        emit CancelEvent(
            _order._id,
            msg.sender,
            _order._tokenGet,
            _order._tokenGive,
            _order._amountGet,
            _order._amountGive,
            block.timestamp
        );
    }

    //? Fill order
    /// @param _id, the id of the order
    //* @returns Success or Revert
    function fillOrder(uint256 _id) public {
        // TODO Fetch order
        Order storage _order = orders[_id];

        // TODO Check if the item exists
        require(_order._id == _id, "The given id does not exists");

        // TODO Order cannot be a canceled one
        require(!canceledOrders[_id], "The order cannot be a canceled one");

        // TODO Order cannot be filled
        require(!filledOrders[_id], "The order cannot be a filled one");

        // TODO Calculate the fee
        uint256 _feeAmount = (_order._amountGet * feePercent) / 100;

        // TODO The msg.sender needs to have enough balance of the tokens the other is asking in sum with the fee
        require(
            tokens[_order._tokenGet][msg.sender] >=
                _order._amountGet + _feeAmount,
            "You don't have enought balance to fill the order"
        );
        // TODO Swap the tokens
        _trade(_order, _feeAmount);

        // TODO Fill the order
        filledOrders[_id] = true;
    }

    //? Function to make the swap happen
    /// @param _order, this is the order info
    //* @return Success
    function _trade(Order storage _order, uint256 _feeAmount) internal {
        // TODO Send the Fee to the account that receives the fee
        tokens[_order._tokenGet][feeAccount] += _feeAmount;
        // TODO Remove tokens from the orderer creator
        tokens[_order._tokenGive][_order._user] -= _order._amountGive;
        // TODO Add the tokens that the order established to swap
        tokens[_order._tokenGet][_order._user] += _order._amountGet;
        // TODO Remove tokens from the orderer filler
        tokens[_order._tokenGet][msg.sender] -= (_order._amountGet +
            _feeAmount);
        // TODO Add the tokens that the filler agreed to give out
        tokens[_order._tokenGive][msg.sender] += _order._amountGive;
        emit Trade(
            _order._id,
            msg.sender,
            _order._tokenGet,
            _order._tokenGive,
            _order._amountGet,
            _order._amountGive,
            _order._user,
            block.timestamp
        );
    }
}
