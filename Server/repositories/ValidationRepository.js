const {promises: fs} = require("fs");
const ContractRepository = require("./ContractRepository");
const SmartRepository = require("./SmartRepository");
const Config = require("../config/config");
const Validations = require("../models/validations");

exports.addValidation = async function (address, process, type, owner, to, token) {
    let validation = new Validations();

    const contract = await ContractRepository.getContract(address);

    if(await Validations.exists({contract: contract._id, process: process, type: type})) {
        throw Error("Validation already exists!");
    }

    validation.contract = contract._id;
    validation.process = process;
    validation.type = type;
    validation.owner = owner;
    validation.to = to;
    validation.token = token;

    validation.save();

    return validation;
}

exports.getValidations = async function (address) {
    return Validations.find({owner: address});
}

exports.getSimilarValidations = async function (contractId, token) {
    return Validations.find({contract: contractId, token: token, active: true});
}

exports.getValidation = async function (address, process, type) {
    const contract = await ContractRepository.getContract(address);
    const validation = await Validations.findOne({contract: contract._id, process: process, type: type});
    if(!validation) throw Error("Validation not found!");

    return validation;
}

exports.existsValidation = async function (address, process, type) {
    const contract = await ContractRepository.getContract(address);
    return Validations.exists({contract: contract._id, process: process, type: type});
}

exports.acceptValidation = async function (address, process, type) {
    let validation = await exports.getValidation(address, process, type);
    if(!validation.active) throw Error("Validation already closed!");

    validation.accept = true;

    validation.save();

    return validation;
}

exports.closeValidation = async function (address, process, type) {
    if(type === "Approve" && !(await exports.existsValidation(address, process, type)))
        type = "ApproveAll";

    let validation = await exports.getValidation(address, process, type);
    const contract = await ContractRepository.getContract(address);

    if(contract.type === "ERC20" || validation.type === "Approve" || validation.type === "ApproveAll") {
        return true;
    }

    let validations = await exports.getSimilarValidations(validation.contract, validation.token);

    for(let v of validations) {
        if(v.process !== validation.process || v.type !== validation.type) {
            v.active = false;
            v.save();
        }
    }

    return true;
}

exports.isValid = async function (address, process, type) {
    if(type === "Approve" && !(await exports.existsValidation(address, process, type)))
        type = "ApproveAll";

    const validation = await exports.getValidation(address, process, type);
    return validation.accept;
}

exports.isActive = async function (address, process, type) {
    if(type === "Approve" && !(await exports.existsValidation(address, process, type)))
        type = "ApproveAll";

    const validation = await exports.getValidation(address, process, type);
    return validation.active;
}

exports.validateEvent = async function (address, process, type) {
    if(type === "Approve" && !(await exports.existsValidation(address, process, type)))
        type = "ApproveAll";


    let validation = await exports.getValidation(address, process, type);

    validation.active = false;
    validation.save();
}