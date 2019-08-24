pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";


library UniversalERC20 {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    function universalTransfer(IERC20 token, address to, uint256 amount) internal {
        universalTransfer(token, to, amount, false);
    }

    function universalTransfer(IERC20 token, address to, uint256 amount, bool allowFail) internal returns(bool) {

        if (token == IERC20(0) || address(token) == ETH_ADDRESS) {
            if (allowFail) {
                return address(uint160(to)).send(amount);
            } else {
                address(uint160(to)).transfer(amount);
                return true;
            }
        } else {
            token.safeTransfer(to, amount);
            return true;
        }
    }

    function universalApprove(IERC20 token, address to, uint256 amount) internal {
        if (address(token) == address(0) || address(token) == ETH_ADDRESS) {
            return;
        }
        token.safeApprove(to, amount);
    }

    function universalTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        if (address(token) == address(0) || address(token) == ETH_ADDRESS) {
            if (to == address(this)) {
                require(from == msg.sender && msg.value >= amount, "msg.value is zero");
                if (msg.value > amount) {
                    msg.sender.transfer(msg.value.sub(amount));
                }
            } else {
                address(uint160(to)).transfer(amount);
            }
            return;
        }

        token.safeTransferFrom(from, to, amount);
    }

    function universalBalanceOf(IERC20 token, address who) internal returns (uint256) {

        if (address(token) == address(0) || address(token) == ETH_ADDRESS) {
            return who.balance;
        }

        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.balanceOf.selector, who)
        );

        return success ? _bytesToUint(data) : 0;
    }

    function universalDecimals(IERC20 token) internal returns (uint256) {

        if (address(token) == address(0) || address(token) == ETH_ADDRESS) {
            return 18;
        }

        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSignature("decimals()")
        );
        if (!success) {
            (success, data) = address(token).call(
                abi.encodeWithSignature("DECIMALS()")
            );
        }

        return success ? _bytesToUint(data) : 18;
    }

    function universalName(IERC20 token) internal returns(string memory) {

        if (address(token) == address(0) || address(token) == ETH_ADDRESS) {
            return "Ether";
        }

        // solium-disable-next-line security/no-low-level-calls
        (bool success, bytes memory symbol) = address(token).call(abi.encodeWithSignature("symbol()"));
        if (!success) {
            // solium-disable-next-line security/no-low-level-calls
            (success, symbol) = address(token).call(abi.encodeWithSignature("SYMBOL()"));
        }

        return success ? _handleReturnBytes(symbol) : "";
    }

    function universalSymbol(IERC20 token) internal returns(string memory) {

        if (address(token) == address(0) || address(token) == ETH_ADDRESS) {
            return "ETH";
        }

        // solium-disable-next-line security/no-low-level-calls
        (bool success, bytes memory name) = address(token).call(abi.encodeWithSignature("name()"));
        if (!success) {
            // solium-disable-next-line security/no-low-level-calls
            (success, name) = address(token).call(abi.encodeWithSignature("NAME()"));
        }

        return success ? _handleReturnBytes(name) : "";
    }

    function _bytesToUint(bytes memory data) private pure returns(uint256 result) {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            result := mload(add(data, 32))
        }
    }

    function _handleReturnBytes(bytes memory str) private pure returns(string memory result) {

        result = string(str);

        if (str.length > 32) {
            // solium-disable-next-line security/no-inline-assembly
            assembly {
                result := add(str, 32)
            }
        }
    }
}
