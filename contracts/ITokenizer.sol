pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ILoanPool.sol";

interface ITokenizer {

    function enterMarkets(
        uint256 tokenId,
        address controller,
        address[] calldata cTokens
    )
        external
        returns(bytes memory ret);

    function migrate(
        ILoanPool pool,
        IERC20 collateralToken,
        uint256 collateralAmount,
        IERC20 borrowedToken,
        IERC20 borrowedUnderlyingToken,
        uint256 borrowedAmount,
        address msgSender
    )
        external;

    function mint(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external
        payable;

    function redeem(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external;

    function borrow(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external;

    function repay(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external
        payable;
}
