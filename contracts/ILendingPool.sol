pragma solidity ^0.5.0;

interface ILendingPool {
    function deposit(address _reserve, uint256 _amount, bool _useAsCollateral, uint16 _referralCode) external payable;
    function redeem(address _aToken, uint256 _aTokenAmount) external;
    function borrow(address _reserve, uint256 _amount, uint256 _interestRateMode, uint16 _referralCode) external;
    function repay(address _reserve, uint256 _amount, address _onBehalfOf) external payable;
}
