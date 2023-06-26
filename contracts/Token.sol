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
    //balance of a certain account
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /* HELP METHODS */
    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal returns (bool success) {
        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    /* EVENTs CREATION */
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);
        //GIVE ALL THE SUPPLY TO THE CREATOR OF THE SMART CONTRACT
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        //Require that sender has enough tokens to spend
        require(
            balanceOf[msg.sender] >= _value,
            "You need to have enought balance"
        );
        require(
            _to != address(0),
            "You should send the tokens to a valid address"
        );
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        require(
            balanceOf[msg.sender] >= _value,
            "You must have enought balance to approve someone to spend your tokens"
        );
        require(
            _spender != address(0),
            "The address you are approving to use your tokens is not valid"
        );
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            allowance[_from][msg.sender] >= _value,
            "You don't have enough allowance"
        );
        require(
            balanceOf[_from] >= _value,
            "The account that you are taking tokens from does not have enought balance"
        );
        require(_to != address(0), "Please send the tokens to a valid address");
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
        _transfer(_from, _to, _value);
        return true;
    }
}
