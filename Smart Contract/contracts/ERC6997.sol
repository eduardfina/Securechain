// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.0;

import "./IERC6997.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @dev Implementation of ERC6997
 */
contract ERC6997 is IERC6997, ERC721 {

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
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_){
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
        require(transferId < _totalTransferValidations, "ERC6997: invalid transfer ID");
        TransferValidation memory v = _transferValidation(transferId);

        return v;
    }

    /**
     * @dev Returns the approval validation struct using the approval ID.
     *
     */
    function approvalValidation(uint256 approvalId) public view override returns (ApprovalValidation memory) {
        require(approvalId < _totalApprovalValidations, "ERC6997: invalid approval ID");
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
        require(!v.valid, "ERC6997: the transfer is already validated");

        address from = v.from;
        address to = v.to;
        uint256 tokenId = v.tokenId;

        super._transfer(from, to, tokenId);

        _transferValidations[transferId].valid = true;
    }

    /**
     * @dev Validate the approval using the approval ID.
     *
     */
    function _validateApproval(uint256 approvalId) internal virtual {
        ApprovalValidation memory v = approvalValidation(approvalId);
        require(!v.valid, "ERC6997: the approval is already validated");

        if(!v.approveAll) {
            require(v.owner == ownerOf(v.tokenId), "ERC6997: The token have a new owner");
            super._approve(v.approve, v.tokenId);
        }
        else {
            super._setApprovalForAll(v.owner, v.approve, true);
        }

        _approvalValidations[approvalId].valid = true;
    }

    /**
     * @dev Create a transfer petition of `tokenId` from `from` to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {TransferValidate} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        require(ERC721.ownerOf(tokenId) == from, "ERC6997: transfer from incorrect owner");
        require(to != address(0), "ERC6997: transfer to the zero address");

        if(_msgSender() == from) {
            TransferValidation memory v;

            v.from = from;
            v.to = to;
            v.tokenId = tokenId;

            _transferValidations[_totalTransferValidations] = v;

            emit ValidateTransfer(from, to, tokenId, _totalTransferValidations);

            _totalTransferValidations++;
        } else {
            super._transfer(from, to, tokenId);
        }
    }

    /**
     * @dev Create an approval petition from `to` to operate on `tokenId`
     *
     * Emits an {ValidateApproval} event.
     */
    function _approve(address to, uint256 tokenId) internal override virtual {
        ApprovalValidation memory v;

        v.owner = ownerOf(tokenId);
        v.approve = to;
        v.tokenId = tokenId;

        _approvalValidations[_totalApprovalValidations] = v;

        emit ValidateApproval(v.owner, to, tokenId, false, _totalApprovalValidations);

        _totalApprovalValidations++;
    }

    /**
     * @dev If approved is true create an approval petition from `operator` to operate on
     * all of `owner` tokens, if not remove `operator` from operate on all of `owner` tokens
     *
     * Emits an {ValidateApproval} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal override virtual {
        require(owner != operator, "ERC6997: approve to caller");

        if(approved) {
            ApprovalValidation memory v;

            v.owner = owner;
            v.approve = operator;
            v.approveAll = true;

            _approvalValidations[_totalApprovalValidations] = v;

            emit ValidateApproval(v.owner, operator, 0, true, _totalApprovalValidations);

            _totalApprovalValidations++;
        }
        else {
            super._setApprovalForAll(owner, operator, approved);
        }
    }
}