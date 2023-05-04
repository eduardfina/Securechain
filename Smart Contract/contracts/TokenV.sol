// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

import "./ERC20V.sol";
import "./Permission.sol";

contract TokenV is ERC20V {

    address public validator;
    address public permissionContract;

    constructor (string memory _name, string memory _symbol, address _validator, address _permissionContract) ERC20V(_name, _symbol){
        validator = _validator;
        permissionContract = _permissionContract;
    }

    modifier onlyValidator() {
        require(_msgSender() == validator, "Validator: sender is not the validator");
        _;
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    /**
     * @dev Create a transfer petition of `tokenId` from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     *
     * Emits a {ValidateTransfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        if(Permission(permissionContract).permission(_msgSender())) {
            ERC20._transfer(from, to, amount);
        } else {
            super._transfer(from, to, amount);
        }
    }

    /**
     * @dev Create an approve petition from `owner` to operate the `amount`
     *
     * Emits an {ValidateApprove} event.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual override {
        if(Permission(permissionContract).permission(_msgSender())) {
            ERC20._approve(owner, spender, amount);
        } else {
            super._approve(owner, spender, amount);
        }
    }

    function validateTransfer(uint256 transferId) public onlyValidator {
        _validateTransfer(transferId);
    }

    function validateApprove(uint256 approveId) public onlyValidator {
        _validateApprove(approveId);
    }
}