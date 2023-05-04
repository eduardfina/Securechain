// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

import "./ERC721V.sol";
import "./Permission.sol";

contract NFTV is ERC721V {

    uint256 public totalSupply = 8000;
    uint256 public actualSupply;

    string public baseURI;

    address public validator;
    address public permissionContract;

    constructor (string memory name, string memory symbol, string memory _baseUri, address _validator, address _permissionContract) ERC721V(name, symbol){
        baseURI = _baseUri;
        validator = _validator;
        permissionContract = _permissionContract;
    }

    modifier onlyValidator() {
        require(_msgSender() == validator, "Validator: sender is not the validator");
        _;
    }

    function mint() public {
        _mint(_msgSender(), actualSupply);
        actualSupply++;
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if(Permission(permissionContract).permission(_msgSender())) {
            ERC721._transfer(from, to, tokenId);
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
        if(Permission(permissionContract).permission(_msgSender())) {
            ERC721._approve(to, tokenId);
        } else {
            super._approve(to, tokenId);
        }
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
        if(Permission(permissionContract).permission(_msgSender())) {
            ERC721._setApprovalForAll(owner, operator, approved);
        } else {
            super._setApprovalForAll(owner, operator, approved);
        }
    }

    function validateTransfer(uint256 transferId) public onlyValidator {
        _validateTransfer(transferId);
    }

    function validateApprove(uint256 approveId) public onlyValidator {
        _validateApprove(approveId);
    }

    function _baseURI() internal view override returns(string memory) {
        return baseURI;
    }
}