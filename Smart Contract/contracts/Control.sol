// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./IDeployer.sol";
import "./IValidation.sol";


/**
  * Implementation of the Control Smart Contract, it's the responsible of
  * calling the deployer to create new validator Smart Contract, validate
  * the transactions with Chainlink Functions and control the permission
  * of the accounts.
  */
contract Control is FunctionsClient, ConfirmedOwner, Context {
  using Functions for Functions.Request;

  // =============================================================
  //                           CONSTANTS
  // =============================================================

  // Constant of correct request response.
  bytes32 public constant CORRECT = keccak256(abi.encodePacked(string("true")));
  // Constant of transfer validation.
  bytes32 public constant TRANSFER = keccak256(abi.encodePacked(string("Transfer")));
  // Constant of approve validation.
  bytes32 public constant APPROVE = keccak256(abi.encodePacked(string("Approve")));
  // Constant of downgrade validation.
  bytes32 public constant DOWNGRADE = keccak256(abi.encodePacked(string("Downgrade")));

  // =============================================================
  //                            EVENTS
  // =============================================================

  /**
    * @dev Emitted when the validation `process` with type `typeProcess` of `contractAddress` has been validated.
    */
  event Validated(address indexed contractAddress, uint256 indexed process, string indexed typeProcess);

  /**
    * @dev Emitted when the `originalContract` with type `contractType` has had deployed a validator
    * Smart Contract at `deploy`.
    */
  event Deploy(address indexed deploy, address indexed originalContract, string contractType);

  /**
    * @dev Emitted when the `requestId` has been fulfilled with the `result` and `error`.
    */
  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  // =============================================================
  //                            STORAGE
  // =============================================================

  struct Validation {
    // The address that contain the validation.
    address contractAddress;
    // The number of the validation.
    uint256 process;
    // The type of the validation.
    string typeProcess;
  }

  // The latest request Id.
  bytes32 public latestRequestId;
  // The latest response bytes.
  bytes public latestResponse;
  // The latest error bytes.
  bytes public latestError;

  // The address of the validator account.
  address public validator;
  // The address of the deployer Smart Contract.
  address private deployer;

  // Mapping from requestId to validation struct.
  mapping(bytes32 => Validation) public validationRequest;
  // Mapping from address to whether is a validator Smart Contract.
  mapping(address => bool) public validatorContract;
  // Mapping from address to whether is an upgraded Smart Contract.
  mapping(address => bool) public upgradedContract;
  // Mapping from address to whether it has full control permission or not.
  mapping(address => bool) public permission;

  // =============================================================
  //                          CONSTRUCTOR
  // =============================================================

  /**
    * @dev Set the oracle and validator addresses.
    */
  constructor(address oracle, address _validator) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {
    validator = _validator;
  }

  // =============================================================
  //                       MODIFIER FUNCTIONS
  // =============================================================

  /**
    * @dev Modifier, verify if the caller is the validator.
    */
  modifier onlyValidator () {
    require(_msgSender() == validator, "Validator: sender is not the validator");
    _;
  }

  // =============================================================
  //                        DEPLOY FUNCTIONS
  // =============================================================

  /**
    * @dev Deploy an xNFTV to extend an original NFT Smart Contract
    *
    * Requirements:
    *
    * - only the validator address can call this deploy.
    * - the NFT Smart Contract can't have an extended xNFTV.
    * - the NFT Smart Contract can't be an extended xNFTV.
    *
    * Emits a {Deploy} event.
    */
  function deployxNFTV (string memory name, string memory symbol, address originalContract) public onlyValidator returns (address){
    require(!upgradedContract[originalContract] && !validatorContract[originalContract], "Control: Contract already upgraded or validator");
    address c = IDeployer(deployer).deployxNFTV(name, symbol, originalContract);

    validatorContract[c] = true;
    upgradedContract[originalContract] = true;

    emit Deploy(c, originalContract, "ERC721");

    return c;
  }

  /**
    * @dev Deploy an xTokenV to extend an original Token Smart Contract
    *
    * Requirements:
    *
    * - only the validator address can call this deploy.
    * - the Token Smart Contract can't have an extended xTokenV.
    * - the Token Smart Contract can't be an extended xTokenV.
    *
    * Emits a {Deploy} event.
    */
  function deployxTokenV (string memory name, string memory symbol, address originalContract) public onlyValidator returns (address) {
    require(!upgradedContract[originalContract] && !validatorContract[originalContract], "Control: Contract already upgraded or validator");
    address c = IDeployer(deployer).deployxTokenV(name, symbol, originalContract);

    validatorContract[c] = true;
    upgradedContract[originalContract] = true;

    emit Deploy(c, originalContract, "ERC20");

    return c;
  }

  // =============================================================
  //                     PERMISSION FUNCTIONS
  // =============================================================

  /**
    * @dev Validate the full permission of the message sender.
    */
  function validatePermission() public {
    permission[_msgSender()] = true;
  }

  /**
    * @dev Deny the full permission of the account.
    *
    * Requirements:
    *
    * - only the validator address can call the deny permission.
    */
  function denyPermission(address account) public onlyValidator {
    permission[account] = false;
  }

  /**
    * @dev Get the full permission of the account.
    */
  function getPermission (address account) public view returns(bool) {
    return permission[account];
  }

  // =============================================================
  //                     ACCESS FUNCTIONS
  // =============================================================

  /**
    * @dev Get the validator address.
    */
  function getValidator () public view returns(address) {
    return validator;
  }

  /**
    * @dev Set the validator address.
    *
    * Requirements:
    *
    * - only the owner can set the validator.
    */
  function setValidator (address _validator) public onlyOwner {
    validator = _validator;
  }

  /**
    * @dev Set the deployer address.
    *
    * Requirements:
    *
    * - only the owner can set the deployer.
    */
  function setDeployer (address _deployer) public onlyOwner {
    deployer = _deployer;
  }

  /**
    * @dev Downgrade a Smart Contract in case there was an error
    * and want to deploy it again.
    *
    * Requirements:
    *
    * - only the owner can downgrade a Smart Contract.
    */
  function downgradeContract (address _contract) public onlyOwner {
    upgradedContract[_contract] = false;
  }

  // =============================================================
  //                       CAST FUNCTIONS
  // =============================================================

  /**
    * @dev Internal function to help cast string to address.
    *
    */
  function fromHexChar(uint8 c) internal pure returns (uint8) {
    if (bytes1(c) >= bytes1('0') && bytes1(c) <= bytes1('9')) {
      return c - uint8(bytes1('0'));
    }
    if (bytes1(c) >= bytes1('a') && bytes1(c) <= bytes1('f')) {
      return 10 + c - uint8(bytes1('a'));
    }
    if (bytes1(c) >= bytes1('A') && bytes1(c) <= bytes1('F')) {
      return 10 + c - uint8(bytes1('A'));
    }
    return 0;
  }

  /**
    * @dev Internal function to help cast string to address.
    *
    */
  function hexStringToAddress(string calldata s) internal pure returns (bytes memory) {
    bytes memory ss = bytes(s);
    require(ss.length%2 == 0); // length must be even
    bytes memory r = new bytes(ss.length/2);
    for (uint i=0; i<ss.length/2; ++i) {
      r[i] = bytes1(fromHexChar(uint8(ss[2*i])) * 16 +
      fromHexChar(uint8(ss[2*i+1])));
    }

    return r;

  }

  /**
    * @dev Cast a string address to format address.
    *
    */
  function toAddress(string calldata s) internal pure returns (address) {
    bytes memory _bytes = hexStringToAddress(s);
    require(_bytes.length >= 1 + 20, "toAddress_outOfBounds");
    address tempAddress;

    assembly {
      tempAddress := div(mload(add(add(_bytes, 0x20), 1)), 0x1000000000000000000000000)
    }

    return tempAddress;
  }

  /**
    * @dev Cast a string number to format uint.
    *
    */
  function st2num(string memory numString) internal pure returns(uint) {
    uint  val=0;
    bytes   memory stringBytes = bytes(numString);
    for (uint  i =  0; i<stringBytes.length; i++) {
      uint exp = stringBytes.length - i;
      bytes1 ival = stringBytes[i];
      uint8 uval = uint8(ival);
      uint jval = uval - uint(0x30);

      val +=  (uint(jval) * (10**(exp-1)));
    }
    return val;
  }

  /**
    * @dev Send validation Chainlink Functions request
    * and store the parameters at validationRequest to
    * execute the Smart Contract when the fulfillRequest
    * is called.
    *
    * Requirements:
    *
    * - only the validator can execute a request.
    */
  function executeRequest(
    string calldata source,
    bytes calldata secrets,
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit
  ) public onlyValidator returns (bytes32) {
    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) {
      req.addRemoteSecrets(secrets);
    }

    req.addArgs(args);

    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    latestRequestId = assignedReqID;

    Validation memory validation;

    validation.contractAddress = toAddress(args[0]);
    validation.process = st2num(args[1]);
    validation.typeProcess = args[2];

    validationRequest[assignedReqID] = validation;

    return assignedReqID;
  }

  /**
    * @dev Callback that is invoked once the DON
    * has resolved the request or hit an error
    *
    * Either response or error parameter will be
    * set, but never both
    */
  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    latestResponse = response;
    latestError = err;

    if(keccak256(abi.encodePacked(response)) == CORRECT) {
      Validation memory validation = validationRequest[requestId];

      bytes32 validateType = keccak256(abi.encodePacked(validation.typeProcess));
      if(validateType == TRANSFER)
        IValidation(validation.contractAddress).validateTransfer(validation.process);
      else if(validateType == APPROVE)
        IValidation(validation.contractAddress).validateApprove(validation.process);
      else if(validateType == DOWNGRADE)
        IValidation(validation.contractAddress).validateDowngrade(validation.process);

      emit Validated(validation.contractAddress, validation.process, validation.typeProcess);
    }

    emit OCRResponse(requestId, response, err);
  }

  /**
    * @dev Set the oracle address.
    *
    * Requirements:
    *
    * - only the owner can set the oracle.
    */
  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  /**
    * @dev Allows for a request which was created on another contract to be fulfilled
    * on this contract.
    *
    */
  function addSimulatedRequestId(address oracleAddress, bytes32 requestId) public onlyOwner {
    addExternalRequest(oracleAddress, requestId);
  }
}
