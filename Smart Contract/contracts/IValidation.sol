// SPDX-License-Identifier: unlicensed
pragma solidity 0.8.17;

interface IValidation {

    function validateTransfer(uint256 transferId) external;

    function validateApproval(uint256 approveId) external;

    function validateDowngrade(uint256 downgradeId) external;
}
