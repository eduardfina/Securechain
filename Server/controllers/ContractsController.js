const bcrypt = require('bcryptjs');
const Config = require("../config/config");
const SmartRepository = require("../repositories/SmartRepository");
const ContractRepository = require('../repositories/ContractRepository');
const DepositRepository = require("../repositories/DepositRepository");
const BlockchainRepository = require("../repositories/BlockchainRepository");

/**
 * Contract Controller
 */

exports.getContractFromAddress = async function (req, res) {
    try {
        const params = req.query;

        if (!params.address) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const contract = await ContractRepository.getContract(address);

        return res.status(200).json({contract: contract});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.getContractFromOriginalAddress = async function (req, res) {
    try {
        const params = req.query;

        if (!params.originalAddress) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const contract = await ContractRepository.getContractFromOriginalAddress(originalAddress);

        return res.status(200).json({contract: contract});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.createContract = async function (req, res) {
    try {
        const params = req.body;

        if (!params.address) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        if(await ContractRepository.isValidatorContract(params.address)) {
            return res.status(400).json({error: "Contract is a validator!"});
        }

        if(await ContractRepository.existsOriginalContract(params.address)) {
            return res.status(400).json({error: "Contract already has a validator!"});
        }

        if(await ContractRepository.isNFTContract(params.address)){
            let name = "x" + (await SmartRepository.call({address: params.address, abi: Config.ERC721Abi}, "name", []));
            let symbol = "x" + (await SmartRepository.call({address: params.address, abi: Config.ERC721Abi}, "symbol", []));

            const contract = await SmartRepository.transaction(Config.control, "deployxNFTV", [name, symbol, params.address]);

            return res.status(200).json({contract: contract});

        } else if (await ContractRepository.isTokenContract(params.address)) {
            let name = "x" + (await SmartRepository.call({address: params.address, abi: Config.ERC20Abi}, "name", []));
            let symbol = "x" + (await SmartRepository.call({address: params.address, abi: Config.ERC20Abi}, "symbol", []));

            const contract = await SmartRepository.transaction(Config.control, "deployxTokenV", [name, symbol, params.address]);

            return res.status(200).json({contract: contract});
        }

        return res.status(400).json({error: "Contract is not ERC20 or ERC721!"});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.getUserAssets = async function (req, res) {
    try {
        const params = req.query;

        if (!params.address) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const assets = await BlockchainRepository.getUserAssets(params.address);

        return res.status(200).json({assets: assets});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}