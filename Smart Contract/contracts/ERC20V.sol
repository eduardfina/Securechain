// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IERC20V.sol";

/**
 * @dev Implementation of ERC721V
 */
contract ERC20V is IERC20V, ERC20 {

    // Mapping from transfer ID to transfer validation
    mapping(uint256 => TransferValidation) private _transferValidations;

    // Mapping from approve ID to approve validation
    mapping(uint256 => ApproveValidation) private _approveValidations;

    // Total number of transfer validations
    uint256 private _totalTransferValidations;

    // Total number of approve validations
    uint256 private _totalApproveValidations;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_){
    }

    /**
    * @dev Returns true if this contract is a validator ERC721.
    */
    function isValidatorContract() public pure returns (bool) {
        return true;
    }

    /**
     * @dev Returns the transfer validation struct using the transfer ID.
     *
     */
    function transferValidation(uint256 transferId) public view override returns (TransferValidation memory) {
        require(transferId < _totalTransferValidations, "ERC20V: invalid transfer ID");
        TransferValidation memory v = _transferValidation(transferId);

        return v;
    }

    /**
     * @dev Returns the approve validation struct using the approve ID.
     *
     */
    function approveValidation(uint256 approveId) public view override returns (ApproveValidation memory) {
        require(approveId < _totalApproveValidations, "ERC20V: invalid approve ID");
        ApproveValidation memory v = _approveValidation(approveId);

        return v;
    }

    /**
     * @dev Return the total amount of transfer validations created.
     *
     */
    function totalTransferValidations() public view override returns (uint256) {
        return _totalTransferValidations;
    }

    /**
     * @dev Return the total amount of approve validations created.
     *
     */
    function totalApproveValidations() public view override returns (uint256) {
        return _totalApproveValidations;
    }

    /**
     * @dev Returns the transfer validation of the `transferId`. Does NOT revert if transfer doesn't exist
     */
    function _transferValidation(uint256 transferId) internal view virtual returns (TransferValidation memory) {
        return _transferValidations[transferId];
    }

    /**
     * @dev Returns the approve validation of the `approveId`. Does NOT revert if transfer doesn't exist
     */
    function _approveValidation(uint256 approveId) internal view virtual returns (ApproveValidation memory) {
        return _approveValidations[approveId];
    }

    /**
     * @dev Validate the transfer using the transfer ID.
     *
     */
    function _validateTransfer(uint256 transferId) internal virtual {
        TransferValidation memory v = transferValidation(transferId);
        require(!v.valid, "ERC721V: the transfer is already validated");

        super._transfer(v.from, v.to, v.amount);

        _transferValidations[transferId].valid = true;
    }

    /**
     * @dev Validate the approve using the approve ID.
     *
     */
    function _validateApprove(uint256 approveId) internal virtual {
        ApproveValidation memory v = approveValidation(approveId);
        require(!v.valid, "ERC20V: the approve is already validated");

        super._approve(v.owner, v.spender, v.amount);

        _transferValidations[approveId].valid = true;
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
        require(from != address(0), "ERC20V: transfer from the zero address");
        require(to != address(0), "ERC20V: transfer to the zero address");

        if(_msgSender() == from) {
            TransferValidation memory v;

            v.from = from;
            v.to = to;
            v.amount = amount;

            _transferValidations[_totalTransferValidations] = v;

            emit ValidateTransfer(from, to, amount, _totalTransferValidations);

            _totalTransferValidations++;
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
        require(owner != address(0), "ERC20V: approve from the zero address");
        require(spender != address(0), "ERC20V: approve to the zero address");

        ApproveValidation memory v;

        v.owner = owner;
        v.spender = spender;
        v.amount = amount;

        _approveValidations[_totalApproveValidations] = v;

        emit ValidateApprove(v.owner, spender, amount, _totalApproveValidations);

        _totalApproveValidations++;
    }
}