pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ILoanPool.sol";
import "./ICERC20.sol";
import "./LoanHolder.sol";
import "./UniversalERC20.sol";

contract ITokenization {

    function migrate(
        ILoanPool pool,
        IERC20 collateralToken,
        uint256 collateralAmount,
        ICERC20 borrowedToken,
        IERC20 borrowedUnderlyingToken,
        uint256 borrowedAmount,
        address msgSender
    )
        external;

    function enterMarkets(
        uint256 tokenId,
        ICompoundController controller,
        address[] calldata cTokens
    )
        external;

    function mint(
        uint256 tokenId,
        ICERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external;

    function redeem(
        uint256 tokenId,
        ICERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external;

    function borrow(
        uint256 tokenId,
        ICERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external;

    function repay(
        uint256 tokenId,
        ICERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external;
}
