const SmartRepository = require("../repositories/SmartRepository");
const UserRepository = require("../repositories/UserRepository");
const ContractsRepository = require("../repositories/ContractRepository");
const PermissionTransaction = require("../models/permissionTransaction");
const Config = require("../config/config");

exports.getPermission = async function (address) {
    return await SmartRepository.call(Config.control, "getPermission", [address]);
}

exports.denyPermission = async function (address) {
    const transaction = await SmartRepository.transaction(Config.control, "denyPermission", [address]);
}

exports.sendNFT = async function (senderAddress, toAddress, contractAddress, token) {
    if (!await exports.getPermission(senderAddress))
        throw Error("The user doesn't have full permission activated");

    const contract = await ContractsRepository.getContract(contractAddress);

    if(contract.type !== "ERC721")
        throw Error("The contract is not a validator NFT");

    if(senderAddress !== (await SmartRepository.call({address: contractAddress, abi: Config.xNFTVContractAbi}, "ownerOf", [token])))
        throw Error("The sender is not the owner");

    const transaction = await SmartRepository.transaction({address: contractAddress, abi: Config.xNFTVContractAbi}, "transferFrom", [senderAddress, toAddress, token]);

    return await createTransaction(senderAddress, toAddress, contract, token, transaction);
}

exports.sendTokens = async function (senderAddress, toAddress, contractAddress, token) {
    if (!await exports.getPermission(senderAddress))
        throw Error("The user doesn't have full permission activated");

    const contract = await ContractsRepository.getContract(contractAddress);

    if(contract.type !== "ERC20")
        throw Error("The contract is not a validator Token");

    if(Number(token) > Number(await SmartRepository.call({address: contractAddress, abi: Config.xTokenVContractAbi}, "balanceOf", [senderAddress])))
        throw Error("The sender doesn't have enough balance");

    const transaction = await SmartRepository.transaction({address: contractAddress, abi: Config.xTokenVContractAbi}, "transferFrom", [senderAddress, toAddress, token]);

    return await createTransaction(senderAddress, toAddress, contract, token, transaction);
}

createTransaction = async function (senderAddress, toAddress, contract, token, transaction) {
    let permissionTransaction = new PermissionTransaction();

    const user = await UserRepository.getUserByAddress(senderAddress);

    permissionTransaction.creator = user._id;
    permissionTransaction.from = senderAddress;
    permissionTransaction.to = toAddress;
    permissionTransaction.contract = contract._id;
    permissionTransaction.token = token;
    permissionTransaction.hash = transaction;

    permissionTransaction.save();

    return permissionTransaction;
}

exports.getTransactions = async function (address) {
    return PermissionTransaction.find({$or: [{from: address}, {to: address}]});
}

exports.existsTransaction = async function (hash) {
    return PermissionTransaction.exists({hash: hash});
}

exports.validateTransaction = async function (hash) {
    let permissionTransaction = await PermissionTransaction.findOne({hash: hash});

    if(permissionTransaction) {
        permissionTransaction.valid = true;
        permissionTransaction.save();
    }
}