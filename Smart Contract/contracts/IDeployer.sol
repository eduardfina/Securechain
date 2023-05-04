// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

interface IDeployer {

  function deployxNFTV (string memory name, string memory symbol, address originalContract) external returns (address);

  function deployxTokenV (string memory name, string memory symbol, address originalContract) external returns (address);
}