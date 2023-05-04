// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";

contract Permission is Context {

    mapping(address => bool) public permission;
    address public validator;

    constructor (address _validator){
        validator = _validator;
    }

    modifier onlyValidator() {
        require(_msgSender() == validator, "Validator: sender is not the validator");
        _;
    }

    function validatePermission() public {
        permission[_msgSender()] = true;
    }

    function denyPermission(address account) public onlyValidator {
        permission[account] = false;
    }
}