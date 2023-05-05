// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC721V.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @dev Implementation of ERC721V
 */
contract ERC721V is IERC721V, ERC721 {

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
        require(transferId < _totalTransferValidations, "ERC721V: invalid transfer ID");
        TransferValidation memory v = _transferValidation(transferId);

        return v;
    }

    /**
     * @dev Returns the approve validation struct using the approve ID.
     *
     */
    function approveValidation(uint256 approveId) public view override returns (ApproveValidation memory) {
        require(approveId < _totalApproveValidations, "ERC721V: invalid approve ID");
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

        address from = v.from;
        address to = v.to;
        uint256 tokenId = v.tokenId;

        super._transfer(from, to, tokenId);

        _transferValidations[transferId].valid = true;
    }

    /**
     * @dev Validate the approve using the approve ID.
     *
     */
    function _validateApprove(uint256 approveId) internal virtual {
        ApproveValidation memory v = approveValidation(approveId);
        require(!v.valid, "ERC721V: the approve is already validated");

        if(!v.approveAll) {
            require(v.owner == ownerOf(v.tokenId), "ERC721V: The token have a new owner");
            super._approve(v.approve, v.tokenId);
        }
        else {
            super._setApprovalForAll(v.owner, v.approve, true);
        }

        _approveValidations[approveId].valid = true;
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
        require(ERC721.ownerOf(tokenId) == from, "ERC721V: transfer from incorrect owner");
        require(to != address(0), "ERC721V: transfer to the zero address");

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
     * @dev Create an approve petition from `to` to operate on `tokenId`
     *
     * Emits an {ValidateApprove} event.
     */
    function _approve(address to, uint256 tokenId) internal override virtual {
        ApproveValidation memory v;

        v.owner = ownerOf(tokenId);
        v.approve = to;
        v.tokenId = tokenId;

        _approveValidations[_totalApproveValidations] = v;

        emit ValidateApprove(v.owner, to, tokenId, false, _totalApproveValidations);

        _totalApproveValidations++;
    }

    /**
     * @dev If approved is true create an approve petition from `operator` to operate on
     * all of `owner` tokens, if not remove `operator` from operate on all of `owner` tokens
     *
     * Emits an {ValidateApprove} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal override virtual {
        require(owner != operator, "ERC721V: approve to caller");

        if(approved) {
            ApproveValidation memory v;

            v.owner = owner;
            v.approve = operator;
            v.approveAll = true;

            _approveValidations[_totalApproveValidations] = v;

            emit ValidateApprove(v.owner, operator, 0, true, _totalApproveValidations);

            _totalApproveValidations++;
        }
        else {
            super._setApprovalForAll(owner, operator, approved);
        }
    }
}