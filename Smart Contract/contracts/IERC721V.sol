// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

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