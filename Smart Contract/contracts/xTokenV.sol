// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

import "./ERC7144.sol";
import "./IControl.sol";

contract xTokenV is ERC7144 {

    struct DowngradeValidation {
        // The address of the owner.
        address owner;
        // The token amount.
        uint256 amount;
        // Whether is a valid transfer.
        bool valid;
    }

    /**
     * @dev Emitted when a new downgrade validation has been requested.
     */
    event ValidateDowngrade(address indexed owner, uint256 amount, uint256 indexed downgradeValidationId);

    address public control;
    address public originalContract;

    // Mapping from downgrade ID to downgrade validation
    mapping(uint256 => DowngradeValidation) private _downgradeValidations;

    // Total number of downgrade validations
    uint256 private _totalDowngradeValidations;

    constructor (string memory _name, string memory _symbol, address _control, address _originalContract) ERC7144(_name, _symbol){
        control = _control;
        originalContract = _originalContract;
    }

    modifier onlyActiveControl() {
        require(_msgSender() == control || !IControl(control).isActive(), "Control: sender is not the control");
        _;
    }

    function upgrade(uint256 amount) public {
        require(ERC20(originalContract).balanceOf(_msgSender()) >= amount, "xTokenV: The owner does not have enough tokens");

        ERC20(originalContract).transferFrom(_msgSender(), address(this), amount);
        _mint(_msgSender(), amount);
    }

    function downgrade(address account, uint256 amount) public {
        require(balanceOf(account) >= amount, "xTokenV: The account does not have enough tokens");

        if(IControl(control).getValidator() != _msgSender()) {
            require(_msgSender() == account, "xTokenV: You are not the account");
            DowngradeValidation memory v;

            v.owner = _msgSender();
            v.amount = amount;

            _downgradeValidations[_totalDowngradeValidations] = v;
            emit ValidateDowngrade(_msgSender(), amount, _totalDowngradeValidations);

            _totalDowngradeValidations++;
        } else {
            require(IControl(control).getPermission(account), "xTokenV: Not enough permission");
            _burn(_msgSender(), amount);
            ERC20(originalContract).transfer(_msgSender(), amount);
        }
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        if(IControl(control).getValidator() == _msgSender() && IControl(control).getPermission(from)) {
            _transfer(from, to, amount);
        } else {
            super.transferFrom(from, to, amount);
        }
        return true;
    }

    function validateTransfer(uint256 transferId) public onlyActiveControl {
        if(!IControl(control).isActive()) {
            TransferValidation memory v = transferValidation(transferId);
            require(v.from == _msgSender(), "xTokenV: You are not the owner");
        }
        _validateTransfer(transferId);
    }

    function validateApproval(uint256 approvalId) public onlyActiveControl {
        if(!IControl(control).isActive()) {
            ApprovalValidation memory v = approvalValidation(approvalId);
            require(v.owner == _msgSender(), "xTokenV: You are not the owner");
        }
        _validateApproval(approvalId);
    }

    function validateDowngrade(uint256 downgradeId) public onlyActiveControl {
        DowngradeValidation memory v = downgradeValidation(downgradeId);

        if(!IControl(control).isActive())
            require(v.owner == _msgSender(), "xTokenV: You are not the owner");

        require(!v.valid, "xTokenV: The downgrade is already validated");
        require(balanceOf(v.owner) >= v.amount, "xTokenV: The owner does not have enough tokens");

        _burn(v.owner, v.amount);
        ERC20(originalContract).transfer(v.owner, v.amount);

        _downgradeValidations[downgradeId].valid = true;
    }

    /**
     * @dev Returns the downgrade validation struct using the downgrade ID.
     *
     */
    function downgradeValidation(uint256 downgradeId) public view returns (DowngradeValidation memory) {
        require(downgradeId < _totalDowngradeValidations, "xTokenV: invalid downgrade ID");
        DowngradeValidation memory v = _downgradeValidations[downgradeId];

        return v;
    }
}