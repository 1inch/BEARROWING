pragma solidity ^0.5.0;

interface ICompoundController {
    function enterMarkets(address[] calldata cTokens) external returns(uint[] memory);
}

interface ICERC20 {
    function comptroller() external view returns(ICompoundController);
    function borrowBalanceStored(address account) external view returns(uint256);
    function borrowBalanceCurrent(address account) external returns(uint256);

    function mint() external payable;
    function mint(uint256 amount) external returns(uint256);
    function redeem(uint256 amount) external returns(uint256);
    function borrow(uint256 amount) external returns(uint256);
    function repayBorrowBehalf(address borrower) external payable returns (uint256);
    function repayBorrowBehalf(address borrower, uint repayAmount) external returns (uint256);
}
