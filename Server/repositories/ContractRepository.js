const {promises: fs} = require("fs");
const Contracts = require("../models/contracts");
const SmartRepository = require("./SmartRepository");
const bcrypt = require("bcryptjs");
const Config = require("../config/config");
const Users = require("../models/users");

exports.addContract = async function (address, originalAddress, type) {
    if(await Contracts.exists({address: address})) throw Error("Contract already uploaded!");
    if(await Contracts.exists({address: originalAddress})) throw Error("Original Contract already is a validator!");
    if(await Contracts.exists({originalAddress: originalAddress})) throw Error("Original Contract already has a validator contract!");

    let contract = new Contracts();

    contract.address = address;
    contract.originalAddress = originalAddress;
    contract.type = type;

    contract.save();

    return contract;
}

exports.getContract = async function (address) {
    const contract = await Contracts.findOne({address: address});
    if(!contract) throw Error("Contract not found!");

    return contract;
}

exports.getContractFromOriginalAddress = async function (originalAddress) {
    const contract = await Contracts.findOne({originalAddress: originalAddress});
    if(!contract) throw Error("Contract not found!");

    return contract;
}

exports.isValidatorContract = async function (address) {
    if (!(await SmartRepository.hasMethod(address, "isValidatorContract()"))) return false;

    return await SmartRepository.call({address: address, abi: Config.xNFTVContractAbi}, "isValidatorContract", []);
}

exports.isNFTContract = async function (address) {
    if(!(await SmartRepository.hasMethod(address, "supportsInterface(bytes4)"))) return false;

    return await SmartRepository.call({address: address, abi: Config.ERC721Abi}, "supportsInterface", ["0x80ac58cd"]);
}

exports.isTokenContract = async function (address) {
    if(!(await SmartRepository.hasMethod(address, "name()"))) return false;
    if(!(await SmartRepository.hasMethod(address, "symbol()"))) return false;
    if(!(await SmartRepository.hasMethod(address, "decimals()"))) return false;
    if(!(await SmartRepository.hasMethod(address, "totalSupply()"))) return false;

    return true;
}

exports.isWrappedContract = async function (address) {
    return await SmartRepository.hasMethod(address, "originalContract()");
}

exports.existsContract = function (address) {
    return Contracts.exists({address: address});
}

exports.existsOriginalContract = function (originalAddress) {
    return Contracts.exists({originalAddress: originalAddress});
}

exports.getAllTokenContracts = async function () {
    const contracts = await Contracts.find({type: "ERC20"});

    let tokens = [];

    for(let contract of contracts) {
        tokens.push(contract.address);
        tokens.push(contract.originalAddress);
    }

    return tokens;
}