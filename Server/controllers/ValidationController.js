const bcrypt = require('bcryptjs');
const Config = require("../config/config");
const SmartRepository = require("../repositories/SmartRepository");
const ValidationRepository = require("../repositories/ValidationRepository");
const UserRepository = require("../repositories/UserRepository");
const fs = require("fs");
/**
 * Contract Controller
 */

exports.getValidations = async function (req, res) {
    try {
        const params = req.query;

        if (!params.address) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const validations = await ValidationRepository.getValidations(address);

        return res.status(200).json({validations: validations});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.acceptValidation = async function (req, res) {
    try {
        const params = req.body;

        if (!params.contractAddress || !params.process || !params.type) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(req.user.username);

        const validation = await ValidationRepository.getValidation(params.contractAddress, params.process, params.type);

        if(validation.owner !== user.address) {
            return res.status(400).json({error: "You are not the owner!"});
        }

        const v = await ValidationRepository.acceptValidation(params.contractAddress, params.process, params.type);

        const response = await SmartRepository.transaction(Config.control, "executeRequest", [
            fs.readFileSync("./requests/example.js").toString(),
            [],
            [params.contractAddress, params.process, params.type],
            Config.subscriptionId,
            Config.networks.sepolia.gasPrice
        ]);

        return res.status(200).json({validation: v, response: response});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.closeValidation = async function (req, res) {
    try {
        console.log("Close Validation");
        const params = req.body;

        if (!params.contractAddress || !params.process || !params.type) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const valid = await ValidationRepository.closeValidation(params.contractAddress, params.process, params.type);

        return res.status(200).json({valid: valid});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.isValid = async function (req, res) {
    try {
        console.log("isValid Call")
        const params = req.query;

        if (!params.contractAddress || !params.process || !params.type) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const valid = await ValidationRepository.isValid(params.contractAddress, params.process, params.type);
        const active = await ValidationRepository.isActive(params.contractAddress, params.process, params.type);

        return res.status(200).json({valid: valid && active});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.estimateCostAcceptValidation = async function (req, res) {
    try {
        const params = req.body;

        if (!params.contractAddress || !params.process || !params.type) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const gasPrice = await SmartRepository.getGasPrice();

        const estimateCost = await SmartRepository.call(Config.control, "estimateCost", [
            [Config.codeLocation,
            1,
            Config.codeLanguage,
            fs.readFileSync("./requests/example.js").toString(),
            [],
            [params.contractAddress, params.process, params.type]],
            Config.subscriptionId,
            Config.networks.sepolia.gasPrice,
            gasPrice
        ]);

        return res.status(200).json({estimation: estimateCost});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}