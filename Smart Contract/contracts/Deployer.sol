// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./xNFTV.sol";
import "./xTokenV.sol";
import "./IDeployer.sol";

contract Deployer is IDeployer, Context {

    address control;

    constructor(address _control){
        control = _control;
    }

    modifier onlyController () {
        require(_msgSender() == control, "Validator: sender is not the validator");
        _;
    }

    function deployxNFTV (string memory name, string memory symbol, address originalContract) public onlyController returns (address){
        address nft = address(new xNFTV(name, symbol, control, originalContract));
        return nft;
    }

    function deployxTokenV (string memory name, string memory symbol, address originalContract) public onlyController returns (address) {
        address token = address(new xTokenV(name, symbol, control, originalContract));
        return token;
    }
}
