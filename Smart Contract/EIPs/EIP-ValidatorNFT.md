---
eip: NFT-Validator
title: Validate NFT Transfer and Approve, an Extension of ERC-721
description: A new validation step for transfer and approve calls, achieving a security step in case of stolen wallet.
author: eduardfina (@eduardfina), Eduard López i Fina
discussions-to: https://ethereum-magicians.org/t/erc721-with-a-validation-step/14071
status: Draft
type: Standards Track
category: ERC
created: 2023-05-07
requires: 721
---

## Abstract
This standard is an extension of [ERC-721](./eip-721.md). It defines a new validation functionality to avoid wallet draining, every `transfer` or `approve` will be locked waiting for validation.

## Motivation

The power of the Blockchain is at the same time its weakness, giving the user full responsibility for their data.

Many cases of NFT theft currently exist, and current NFT anti-theft schemes, such as transferring NFTs to cold wallets, make NFTs inconvenient to be used.

Having a validation step before every `transfer` and `approve` would bring the Smart Contract developers the possibility to create a security NFT anti-theft schemes.

When I was developing this standard I was thinking of a system where there would be a validator address that would be responsible for validating all Smart Contract transactions.

This address would be connected to a dApp where the user could see the validation requests of his NFTs and accept the correct ones.

Giving this address only the power to validate transactions would make a much more secure system where to steal an NFT the thief would have to have both the user's address and the validator address simultaneously.

## Specification

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY" and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

[ERC-721](./eip-721.md) compliant contracts MAY implement this EIP.

When `transfer` is called by the owner, the transfer MUST be frozen and a `TransferValidation` MUST be created.

When `approve` is called by the owner, the transfer MUST be frozen and an `ApproveValidation` MUST be created.

When `setApprovalForAll` is called by the owner, the transfer MUST be frozen and an `ApproveValidation` MUST be created.

When the transfer is called by an approved account and not the owner, it MUST be executed directly without the need for validation. This is in order to adapt to all current marketplaces that require approve to directly move your NFTs.

When validating a `TransferValidation` or `ApproveValidation` the valid field MUST be set to true and MUST NOT be validated again.

### Contract Interface

```solidity
 interface IERC721V {

    struct TransferValidation {
        // The address of the owner.
        address from;
        // The address of the receiver.
        address to;
        // The token Id.
        uint256 tokenId;
        // Whether is a valid transfer.
        bool valid;
    }

    struct ApproveValidation {
        // The address of the owner.
        address owner;
        // The approved address.
        address approve;
        // The token Id.
        uint256 tokenId;
        // Wether is a total approvement.
        bool approveAll;
        // Whether is a valid approve.
        bool valid;
    }

    /**
     * @dev Emitted when a new transfer validation has been requested.
     */
    event ValidateTransfer(address indexed from, address to, uint256 indexed tokenId, uint256 indexed transferValidationId);

    /**
    * @dev Emitted when a new approve validation has been requested.
    */
    event ValidateApprove(address indexed owner, address approve, uint256 tokenId, bool indexed approveAll, uint256 indexed approveValidationId);

    /**
     * @dev Returns true if this contract is a validator ERC721.
     */
    function isValidatorContract() external view returns (bool);

    /**
     * @dev Returns the transfer validation struct using the transfer ID.
     *
     */
    function transferValidation(uint256 transferId) external view returns (TransferValidation memory);

    /**
    * @dev Returns the approve validation struct using the approve ID.
    *
    */
    function approveValidation(uint256 approveId) external view returns (ApproveValidation memory);

    /**
     * @dev Return the total amount of transfer validations created.
     *
     */
    function totalTransferValidations() external view returns (uint256);

    /**
     * @dev Return the total amount of transfer validations created.
     *
     */
    function totalApproveValidations() external view returns (uint256);
}
  ```

The `isValidatorContract()` function MUST be implemented as `public`.

The `transferValidation(uint256 transferId)` function MAY be implemented as `public` or `external`.

The `approveValidation(uint256 approveId)` function MAY be implemented as `public` or `external`.

The `totalTransferValidations()` function MAY be implemented as `pure` or `view`.

The `totalApproveValidations()` function MAY be implemented as `pure` or `view`.

## Rationale

### Universality

There are many application scenarios for NFT/SBT, and there is no need to propose a dedicated EIP for each one, which would make the overall number of EIPS inevitably increase and add to the burden of developers. The standard is based on the analysis of the right attached to assets in the real world, and abstracts the right attached to NFT/SBT into holding right and transfer right making the standard more universal.

For example, the standard has more than the following use cases:

SBTs. The SBTs issuer can assign a uniform role of `guard` to the SBTs before they are minted, so that the SBTs cannot be transferred by the corresponding holders and can be managed by the SBTs issuer through the `guard`.

NFT anti-theft. If an NFT holder sets a `guard` address of an NFT as his or her own cold wallet address, the NFT can still be used by the NFT holder, but the risk of theft is greatly reduced.

NFT lending. The borrower sets the `guard` of his or her own NFT as the lender's address, the borrower still has the right to use the NFT while obtaining the loan, but at the same time cannot transfer or sell the NFT. If the borrower defaults on the loan, the lender can transfer and sell the NFT.

Additionally, by setting an `expires` for the `guard`, the scalability of the protocol is further enhanced, as demonstrated in the following examples:

More flexible NFT issuance. During NFT minting, discounts can be offered for NFTs that are locked for a certain period of time, without affecting the NFTs' usability.

More secure NFT management. Even if the `guard` address becomes inaccessible due to lost private keys, the `owner` can still retrieve the NFT after the `guard` has expired.

Valid SBTs. Some SBTs have a period of use. More effective management can be achieved through `guard` and `expires`.

### Extensibility

This standard only defines the validation function, but does not define the system with which it has to be validated. A third-party protocol can define how it wants to call these functions as it wishes.

## Backwards Compatibility

This standard is fully [ERC-721](./eip-721.md) compatible.

## Reference Implementation

```solidity
// SPDX-License-Identifier: CC0-1.0

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
```

## Security Considerations

The `_validateTransfer` and `_validateApprove` functions are created as internal, just as the [ERC-721](./eip-721.md) `mint` function, tries to create a secure system by which they can be called.

## Copyright

Copyright and related rights waived via [CC0](../LICENSE.md).