// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

import "./ERC721V.sol";
import "./IControl.sol";

contract xNFTV is ERC721V {

    struct DowngradeValidation {
        // The address of the owner.
        address owner;
        // The token Id.
        uint256 tokenId;
        // Whether is a valid transfer.
        bool valid;
    }

    /**
     * @dev Emitted when a new downgrade validation has been requested.
     */
    event ValidateDowngrade(address indexed owner, uint256 indexed tokenId, uint256 indexed downgradeValidationId);

    address public control;
    address public originalContract;

    // Mapping from downgrade ID to downgrade validation
    mapping(uint256 => DowngradeValidation) private _downgradeValidations;

    // Total number of downgrade validations
    uint256 private _totalDowngradeValidations;

    constructor (string memory name, string memory symbol, address _control, address _originalContract) ERC721V(name, symbol){
        control = _control;
        originalContract = _originalContract;
    }

    modifier onlyActiveControl() {
        require(_msgSender() == control || !IControl(control).isActive(), "Control: sender is not the control");
        _;
    }

    function upgrade(uint256 tokenId) public {
        require(ERC721(originalContract).ownerOf(tokenId) == _msgSender(), "xNFTV: You are not the NFT owner");

        ERC721(originalContract).transferFrom(_msgSender(), address(this), tokenId);
        _mint(_msgSender(), tokenId);
    }

    function downgrade(uint256 tokenId) public {
        if(IControl(control).getValidator() != _msgSender()) {
            require(ownerOf(tokenId) == _msgSender(), "xNFTV: You are not the NFT owner");

            DowngradeValidation memory v;

            v.owner = _msgSender();
            v.tokenId = tokenId;

            _downgradeValidations[_totalDowngradeValidations] = v;
            emit ValidateDowngrade(_msgSender(), tokenId, _totalDowngradeValidations);

            _totalDowngradeValidations++;
        } else {
            require(IControl(control).getPermission(ownerOf(tokenId)), "xNFTV: Not enough permission");

            _burn(tokenId);
            ERC721(originalContract).transferFrom(address(this), _msgSender(), tokenId);
        }
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        if(IControl(control).getValidator() == _msgSender() && IControl(control).getPermission(from)) {
            _transfer(from, to, tokenId);
        } else {
            super.transferFrom(from, to, tokenId);
        }
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        if(IControl(control).getValidator() == _msgSender() && IControl(control).getPermission(from)) {
            _safeTransfer(from, to, tokenId, data);
        } else {
            super.safeTransferFrom(from, to, tokenId, data);
        }
    }

    function validateTransfer(uint256 transferId) public onlyActiveControl {
        if(!IControl(control).isActive()) {
            TransferValidation memory v = transferValidation(transferId);
            require(v.from == _msgSender(), "xNFTV: You are not the owner");
        }
        _validateTransfer(transferId);
    }

    function validateApprove(uint256 approveId) public onlyActiveControl {
        if(!IControl(control).isActive()) {
            ApproveValidation memory v = approveValidation(approveId);
            require(v.owner == _msgSender(), "xNFTV: You are not the owner");
        }
        _validateApprove(approveId);
    }

    function validateDowngrade(uint256 downgradeId) public onlyActiveControl {
        DowngradeValidation memory v = downgradeValidation(downgradeId);

        if(!IControl(control).isActive())
            require(v.owner == _msgSender(), "xNFTV: You are not the owner");

        require(!v.valid, "xNFTV: The downgrade is already validated");
        require(ownerOf(v.tokenId) == v.owner, "xNFTV: The owner has changed");

        _burn(v.tokenId);
        ERC721(originalContract).transferFrom(address(this), v.owner, v.tokenId);

        _downgradeValidations[downgradeId].valid = true;
    }

    /**
     * @dev Returns the downgrade validation struct using the downgrade ID.
     *
     */
    function downgradeValidation(uint256 downgradeId) public view returns (DowngradeValidation memory) {
        require(downgradeId < _totalDowngradeValidations, "xNFTV: invalid downgrade ID");
        DowngradeValidation memory v = _downgradeValidations[downgradeId];

        return v;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return ERC721(originalContract).tokenURI(tokenId);
    }
}