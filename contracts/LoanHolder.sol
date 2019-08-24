pragma solidity ^0.5.0;

contract LoanHolder {

    address public owner = msg.sender;

    function () external payable {
    }

    function perform(address target, uint256 value, bytes calldata data) external payable returns(bytes memory) {
        require(msg.sender == owner, "Not authorized caller");
        (bool success, bytes memory ret) = target.call.value(value)(data);
        require(success);
        return ret;
    }
}
