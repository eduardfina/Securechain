const bcrypt = require('bcryptjs');
const Config = require("../config/config");
const SmartRepository = require("../repositories/SmartRepository");
const ValidationRepository = require("../repositories/ValidationRepository");
const UserRepository = require("../repositories/UserRepository");
const BlockchainRepository = require("../repositories/BlockchainRepository");
const fs = require("fs");

/**
 * Validator Controller
 */

exports.getValidations = async function (req, res) {
    try {
        const params = req.query;

        if (!params.address) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const validations = await ValidationRepository.getValidations(params.address);

        return res.status(200).json({validations: validations});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.getMyValidations = async function (req, res) {
    try {
        const user = await UserRepository.getUser(req.user.username);

        const validations = await ValidationRepository.getValidationsPopulated(user.address);

        const getMetadata = async (validation) => {
            if (validation.contract.type === "ERC721" && validation.type !== "ApproveAll") {
                try {
                    validation._doc['metadata'] = await BlockchainRepository.getInfoNFT({
                        address: validation.contract.originalAddress,
                        tokenId: validation.token
                    })
                } catch (e) {
                    console.log(e);
                    console.log(validation);
                }
            } else if (validation.contract.type === "ERC20") {
                validation._doc['metadata'] = await BlockchainRepository.getInfoToken(validation.contract.address);
            }
            return validation;
        };

        const validationData = await Promise.all(validations.map(getMetadata));

        let validationsOpen = [];
        let validationsClosed = [];

        for(let validation of validationData) {
            if(validation.active)
                validationsOpen.push(validation);
            else
                validationsClosed.push(validation);
        }

        return res.status(200).json({validationsOpen: validationsOpen, validationsClosed: validationsClosed});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.acceptValidation = async function (req, res) {
    try {
        let params = req.body;

        if (!params.contractAddress || !params.process || !params.type) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(req.user.username);

        const validation = await ValidationRepository.getValidation(params.contractAddress, params.process, params.type);

        if(validation.owner !== user.address) {
            return res.status(400).json({error: "You are not the owner!"});
        }

        const v = await ValidationRepository.acceptValidation(params.contractAddress, params.process, params.type);

        if(params.type === "ApproveAll")
            params.type = "Approve";

        const response = await SmartRepository.transaction(Config.control, "executeRequest", [
            fs.readFileSync("./requests/request.js").toString(),
            `0x${Buffer.from(
                `https://2a4b-81-184-180-154.eu.ngrok.io/secrets.json`
            ).toString("hex")}`,
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
            fs.readFileSync("./requests/request.js").toString(),
            { API_KEY: Config.oracleAuth },
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