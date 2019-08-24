pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ILoanPoolLoaner {

    modifier withLoan(
        ILoanPool pool,
        IERC20 token,
        uint256 amount
    ) {
        if (msg.sender != address(this)) {
            pool.lend(
                token,
                amount,
                this,
                msg.data
            );
            return;
        }

        _;
    }

    function _getExpectedReturn() internal pure returns(uint256 amount) {
        assembly {
            amount := calldataload(sub(calldatasize, 32))
        }
    }

    function inLoan(
        uint256 expectedReturn,
        bytes calldata data
    )
        external
    {
        (bool success,) = address(this).call(abi.encodePacked(data, expectedReturn));
        require(success);
    }
}

interface ILoanPool {

    function lend(
        IERC20 token,
        uint256 amount,
        ILoanPoolLoaner loaner,
        bytes calldata data
    ) external;
}
