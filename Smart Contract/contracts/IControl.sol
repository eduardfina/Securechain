// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

interface IControl {

  function getPermission(address) external view returns(bool);

  function getValidator() external view returns(address);

  function executeRequest(
    string calldata source,
    bytes calldata secrets,
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit
  ) external returns (bytes32);
}