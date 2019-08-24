pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./ILoanPool.sol";
import "./UniversalERC20.sol";

contract LoanPool is ERC20, ERC20Detailed, ILoanPool {

    using SafeMath for uint256;
    using UniversalERC20 for IERC20;

    IERC20 public token;

    constructor(IERC20 theToken) public ERC20Detailed("LoanPool", "LP", 18) {
        token = theToken;
    }

    function () external payable {
        require(token == IERC20(0) && msg.sender != tx.origin);
    }

    function deposit(uint256 value) public payable {

        token.universalTransferFrom(msg.sender, address(this), value);

        uint256 amount = value;
        if (totalSupply() > 0) {
            amount = value
                .mul(totalSupply())
                .div(token.universalBalanceOf(address(this)).sub(value));
        }

        _mint(msg.sender, amount);
    }

    function withdrawal(uint256 share) public {
        token.universalTransfer(
            msg.sender,
            share
                .mul(token.universalBalanceOf(address(this)))
                .div(totalSupply())
        );

        _burn(msg.sender, share);
    }

    function lend(
        IERC20 tkn,
        uint256 amount,
        ILoanPoolLoaner loaner,
        bytes calldata data
    )
        external
    {
        uint256 expectedReturn = tkn.universalBalanceOf(address(this))
            .add(amount.mul(1e14).div(1e18));
        tkn.universalTransfer(address(loaner), amount);

        loaner.inLoan(expectedReturn, data);

        require(tkn.universalBalanceOf(address(this)) >= expectedReturn, "Forgot to repay");
    }
}
