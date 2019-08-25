pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Metadata.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./ITokenizer.sol";
import "./ILoanPool.sol";
import "./ICERC20.sol";
import "./LoanHolder.sol";
import "./UniversalERC20.sol";
import "./GasDiscounter.sol";

contract CompoundTokenization is
    ERC721,
    ERC721Enumerable,
    ERC721Metadata("Compound Position Token", "cPosition"),
    Ownable,
    ILoanPoolLoaner,
    ITokenizer,
    GasDiscounter
{

    using UniversalERC20 for IERC20;

    modifier onlyTokenOwner(uint256 tokenId) {
        require(tokenId == 0 || ownerOf(tokenId) == msg.sender, "Wrong tokenId");
        _;
    }

    function _enterMarket(
        LoanHolder holder,
        ICompoundController controller,
        address cToken1,
        address cToken2
    )
        internal
        returns(LoanHolder)
    {
        holder.perform(address(controller), 0, abi.encodeWithSelector(
            controller.enterMarkets.selector,
            uint256(0x20), // offset
            uint256(2),    // length
            cToken1,
            cToken2
        ));
    }

    function enterMarkets(
        uint256 tokenId,
        address controller,
        address[] calldata cTokens
    )
        external
        onlyTokenOwner(tokenId)
        returns(bytes memory ret)
    {
        LoanHolder holder = LoanHolder(address(tokenId));

        ret = holder.perform(controller, 0, abi.encodeWithSelector(
            ICompoundController(controller).enterMarkets.selector,
            cTokens
        ));
    }

    function migrate(
        ILoanPool pool,
        IERC20 collateralToken,
        uint256 collateralAmount,
        IERC20 borrowedToken,
        IERC20 borrowedUnderlyingToken,
        uint256 borrowedAmount,
        address msgSender
    )
        public
        withLoan(
            pool,
            borrowedUnderlyingToken,
            borrowedAmount = ICERC20(address(borrowedToken)).borrowBalanceCurrent(msgSender)
        )
    {
        LoanHolder holder = new LoanHolder();
        _enterMarket(
            holder,
            ICERC20(address(borrowedToken)).comptroller(),
            address(collateralToken),
            address(borrowedToken)
        );

        // Extract loan
        borrowedUnderlyingToken.universalApprove(address(borrowedToken), borrowedAmount);
        ICERC20(address(borrowedToken)).repayBorrowBehalf(msgSender, borrowedAmount);
        collateralToken.universalTransferFrom(msgSender, address(holder), collateralAmount);

        // Create new loan
        holder.perform(address(borrowedToken), 0, abi.encodeWithSelector(
            ICERC20(address(borrowedToken)).borrow.selector,
            _getExpectedReturn()
        ));

        // Return loan
        if (borrowedToken == IERC20(0)) {
            holder.perform(address(msgSender), _getExpectedReturn(), "");
        } else {
            holder.perform(address(borrowedUnderlyingToken), 0, abi.encodeWithSelector(
                borrowedUnderlyingToken.transfer.selector,
                address(pool),
                _getExpectedReturn()
            ));
        }

        // Transfer position
        _mint(msgSender, uint256(address(holder)));
    }

    function mint(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external
        gasDiscount
        onlyTokenOwner(tokenId)
        payable
    {
        LoanHolder holder = LoanHolder(address(tokenId));
        if (tokenId == 0) {
            holder = new LoanHolder();
            _enterMarket(holder, ICERC20(address(cToken)).comptroller(), address(cToken), address(0));
            _mint(msg.sender, uint256(address(holder)));
        }

        token.universalTransferFrom(msg.sender, address(this), amount);
        token.universalApprove(address(token), amount);
        if (msg.value == 0) {
            ICERC20(address(cToken)).mint(amount);
        } else {
            (bool success,) = address(cToken).call.value(msg.value)(
                abi.encodeWithSignature("mint()")
            );
            require(success, "");
        }
        cToken.universalTransfer(
            address(holder),
            cToken.universalBalanceOf(address(this))
        );
    }

    function redeem(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external
        gasDiscount
        onlyTokenOwner(tokenId)
    {
        LoanHolder holder = LoanHolder(address(tokenId));

        holder.perform(address(cToken), 0, abi.encodeWithSelector(
            ICERC20(address(cToken)).redeem.selector,
            amount
        ));

        if (token != IERC20(0)) {
            holder.perform(address(token), 0, abi.encodeWithSelector(
                token.transfer.selector,
                msg.sender,
                token.universalBalanceOf(address(holder))
            ));
        } else {
            holder.perform(msg.sender, token.universalBalanceOf(address(holder)), "");
        }
    }

    function borrow(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external
        gasDiscount
        onlyTokenOwner(tokenId)
    {
        require(ownerOf(tokenId) == msg.sender, "Wrong tokenId");
        LoanHolder holder = LoanHolder(address(tokenId));

        holder.perform(address(cToken), 0, abi.encodeWithSelector(
            ICERC20(address(cToken)).borrow.selector,
            amount
        ));

        if (token != IERC20(0)) {
            holder.perform(address(token), 0, abi.encodeWithSelector(
                token.transfer.selector,
                msg.sender,
                token.universalBalanceOf(address(holder))
            ));
        } else {
            holder.perform(msg.sender, token.universalBalanceOf(address(holder)), "");
        }
    }

    function repay(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        public
        gasDiscount
        onlyTokenOwner(tokenId)
        payable
    {
        LoanHolder holder = LoanHolder(address(tokenId));

        uint256 borrowAmount = ICERC20(address(cToken)).borrowBalanceCurrent(msg.sender);
        if (amount > borrowAmount) {
            amount = borrowAmount;
        }

        token.universalTransferFrom(msg.sender, address(this), amount);
        token.universalApprove(address(cToken), amount);
        if (token != IERC20(0)) {
            ICERC20(address(cToken)).repayBorrowBehalf(address(holder), amount);
        } else {
            (bool success,) = address(cToken).call.value(msg.value)(
                abi.encodeWithSignature(
                    "repayBorrowBehalf(address)",
                    address(holder)
                )
            );
            require(success, "");
        }
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        return _tokensOfOwner(owner);
    }

    function reclaimToken(IERC20 token) external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.universalTransfer(owner(), balance);
    }
}
