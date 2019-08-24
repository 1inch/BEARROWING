interface IGasToken {
    function freeUpTo(uint256 value) public returns (uint256 freed);
}

contract GasDiscounter {
    IGasToken constant private _gasToken = IGasToken(0x0000000000b3F879cb30FE243b4Dfee438691c04);

    modifier gasDiscount() {
        uint256 initialGasLeft = gasleft();
        _;
        _getGasDiscount(initialGasLeft - gasleft());
    }

    function _getGasDiscount(uint256 gasSpent) private {
        uint256 tokens = (gasSpent + 14154) / 41130;
        _gasToken.freeUpTo(tokens);
    }
}
