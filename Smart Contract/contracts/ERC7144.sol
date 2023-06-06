// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IERC7144.sol";

/**
 * @dev Implementation of ERC7144
 */
contract ERC7144 is IERC7144, ERC20 {

    // Mapping from transfer ID to transfer validation
    mapping(uint256 => TransferValidation) private _transferValidations;

    // Mapping from approval ID to approval validation
    mapping(uint256 => ApprovalValidation) private _approvalValidations;

    // Total number of transfer validations
    uint256 private _totalTransferValidations;

    // Total number of approval validations
    uint256 private _totalApprovalValidations;

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
        require(transferId < _totalTransferValidations, "ERC7144: invalid transfer ID");
        TransferValidation memory v = _transferValidation(transferId);

        return v;
    }

    /**
     * @dev Returns the approval validation struct using the approval ID.
     *
     */
    function approvalValidation(uint256 approvalId) public view override returns (ApprovalValidation memory) {
        require(approvalId < _totalApprovalValidations, "ERC7144: invalid approval ID");
        ApprovalValidation memory v = _approvalValidation(approvalId);

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
     * @dev Return the total amount of approval validations created.
     *
     */
    function totalApprovalValidations() public view override returns (uint256) {
        return _totalApprovalValidations;
    }

    /**
     * @dev Returns the transfer validation of the `transferId`. Does NOT revert if transfer doesn't exist
     */
    function _transferValidation(uint256 transferId) internal view virtual returns (TransferValidation memory) {
        return _transferValidations[transferId];
    }

    /**
     * @dev Returns the approval validation of the `approvalId`. Does NOT revert if transfer doesn't exist
     */
    function _approvalValidation(uint256 approvalId) internal view virtual returns (ApprovalValidation memory) {
        return _approvalValidations[approvalId];
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
     * @dev Validate the approval using the approval ID.
     *
     */
    function _validateApproval(uint256 approvalId) internal virtual {
        ApprovalValidation memory v = approvalValidation(approvalId);
        require(!v.valid, "ERC7144: the approval is already validated");

        super._approve(v.owner, v.spender, v.amount);

        _approvalValidations[approvalId].valid = true;
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
        require(from != address(0), "ERC7144: transfer from the zero address");
        require(to != address(0), "ERC7144: transfer to the zero address");

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
     * @dev Create an approval petition from `owner` to operate the `amount`
     *
     * Emits an {ValidateApproval} event.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual override {
        require(owner != address(0), "ERC7144: approve from the zero address");
        require(spender != address(0), "ERC7144: approve to the zero address");

        ApprovalValidation memory v;

        v.owner = owner;
        v.spender = spender;
        v.amount = amount;

        _approvalValidations[_totalApprovalValidations] = v;

        emit ValidateApproval(v.owner, spender, amount, _totalApprovalValidations);

        _totalApprovalValidations++;
    }
}