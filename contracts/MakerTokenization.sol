pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Metadata.sol";
import "./ITokenizer.sol";
import "./ILoanPool.sol";
import "./ICERC20.sol";
import "./LoanHolder.sol";
import "./UniversalERC20.sol";

interface IDSAuth {
    function owner() external view returns(address);
}

interface IPositionContract {
    function give(address tub_, bytes32 cup, address lad) external;
}

interface IMakerController {
    function lad(bytes32 cup) external view returns(IDSAuth); // Owner of CDP
    // function cups(bytes32 cup) external view returns(
    //     address lad,  // Owner of CDP
    //     uint256 ink,  // Amount of skr
    //     uint256 art,  //
    //     uint256 ire); //
}

contract MakerTokenization is ERC721, ERC721Metadata("Maker Position Token", "mkrPosition"), ILoanPoolLoaner, ITokenizer {

    using UniversalERC20 for IERC20;

    IMakerController public controller;

    modifier onlyTokenOwner(uint256 tokenId) {
        require(tokenId == 0 || ownerOf(tokenId) == msg.sender, "Wrong tokenId");
        _;
    }

    constructor(IMakerController theController) public {
        controller = theController;
    }

    function migrate(bytes32 cup) external {
        require(controller.lad(cup).owner() == msg.sender);

        uint256 tokenId = uint256(cup);
        address prevOwner = ownerOf(tokenId);
        if (prevOwner != address(0) && prevOwner != msg.sender) {
            _transferFrom(prevOwner, msg.sender, tokenId);
        } else {
            _mint(msg.sender, tokenId);
        }
    }

    function mint(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external
        onlyTokenOwner(tokenId)
        payable
    {
        // LoanHolder holder = LoanHolder(address(tokenId));
        // if (tokenId == 0) {
        //     holder = new LoanHolder();
        //     _enterMarket(holder, ICERC20(address(cToken)).comptroller(), address(cToken), address(0));
        //     _mint(msg.sender, uint256(address(holder)));
        // }

        // token.universalTransferFrom(msg.sender, address(this), amount);
        // token.universalApprove(address(token), amount);
        // if (msg.value == 0) {
        //     ICERC20(address(cToken)).mint(amount);
        // } else {
        //     (bool success,) = address(cToken).call.value(msg.value)(
        //         abi.encodeWithSignature("mint()")
        //     );
        //     require(success, "");
        // }
        // cToken.universalTransfer(
        //     address(holder),
        //     cToken.universalBalanceOf(address(this))
        // );
    }

    function redeem(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external
        onlyTokenOwner(tokenId)
    {
        // LoanHolder holder = LoanHolder(address(tokenId));

        // holder.perform(address(cToken), 0, abi.encodeWithSelector(
        //     ICERC20(address(cToken)).redeem.selector,
        //     amount
        // ));

        // if (token != IERC20(0)) {
        //     holder.perform(address(token), 0, abi.encodeWithSelector(
        //         token.transfer.selector,
        //         msg.sender,
        //         token.universalBalanceOf(address(holder))
        //     ));
        // } else {
        //     holder.perform(msg.sender, token.universalBalanceOf(address(holder)), "");
        // }
    }

    function borrow(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        external
        onlyTokenOwner(tokenId)
    {
        // require(ownerOf(tokenId) == msg.sender, "Wrong tokenId");
        // LoanHolder holder = LoanHolder(address(tokenId));

        // holder.perform(address(cToken), 0, abi.encodeWithSelector(
        //     ICERC20(address(cToken)).borrow.selector,
        //     amount
        // ));

        // if (token != IERC20(0)) {
        //     holder.perform(address(token), 0, abi.encodeWithSelector(
        //         token.transfer.selector,
        //         msg.sender,
        //         token.universalBalanceOf(address(holder))
        //     ));
        // } else {
        //     holder.perform(msg.sender, token.universalBalanceOf(address(holder)), "");
        // }
    }

    function repay(
        uint256 tokenId,
        IERC20 cToken,
        IERC20 token,
        uint256 amount
    )
        public
        onlyTokenOwner(tokenId)
        payable
    {
        // LoanHolder holder = LoanHolder(address(tokenId));

        // uint256 borrowAmount = ICERC20(address(cToken)).borrowBalanceCurrent(msg.sender);
        // if (amount > borrowAmount) {
        //     amount = borrowAmount;
        // }

        // token.universalTransferFrom(msg.sender, address(this), amount);
        // token.universalApprove(address(cToken), amount);
        // if (token != IERC20(0)) {
        //     ICERC20(address(cToken)).repayBorrowBehalf(address(holder), amount);
        // } else {
        //     (bool success,) = address(cToken).call.value(msg.value)(
        //         abi.encodeWithSignature(
        //             "repayBorrowBehalf(address)",
        //             address(holder)
        //         )
        //     );
        //     require(success, "");
        // }
    }
}
