const bcrypt = require('bcryptjs');
const Config = require("../config/config");
const SmartRepository = require("../repositories/SmartRepository");
const ContractRepository = require('../repositories/ContractRepository');
const DepositRepository = require("../repositories/DepositRepository");
const BlockchainRepository = require("../repositories/BlockchainRepository");
const UserRepository = require("../repositories/UserRepository");

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

        const contract = await ContractRepository.getContractFromOriginalAddress(params.originalAddress);

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

exports.getMyAssets = async function (req, res) {
    try {
        const user = await UserRepository.getUser(req.user.username);

        const assets = await BlockchainRepository.getUserAssets(user.address);

        for(let i in assets.nft) {
            if (await ContractRepository.existsContract(assets.nft[i].contract.address)) {
                assets.nft[i]['validator'] = true;
                assets.nft[i]['upgradable'] = false;
            }
            else if (await ContractRepository.existsOriginalContract(assets.nft[i].contract.address)) {
                assets.nft[i]['validator'] = false;
                assets.nft[i]['upgradable'] = true;
            } else {
                assets.nft[i]['validator'] = false;
                assets.nft[i]['upgradable'] = false;
            }
        }

        for(let i in assets.token) {
            if (await ContractRepository.existsContract(assets.token[i].address)) {
                assets.token[i]['validator'] = true;
                assets.token[i]['upgradable'] = false;
            }
            else if (await ContractRepository.existsOriginalContract(assets.token[i].address)) {
                assets.token[i]['validator'] = false;
                assets.token[i]['upgradable'] = true;
            } else {
                assets.token[i]['validator'] = false;
                assets.token[i]['upgradable'] = false;
            }
        }

        return res.status(200).json({assets: assets});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

exports.getMySecuredAssets = async function (req, res) {
    try {
        const user = await UserRepository.getUser(req.user.username);

        const assets = await BlockchainRepository.getUserAssets(user.address);

        let nft = [];
        let token = [];

        for(let i in assets.nft) {
            if (await ContractRepository.existsContract(assets.nft[i].contract.address))
                nft.push(assets.nft[i]);
        }

        for(let i in assets.token) {
            if (await ContractRepository.existsContract(assets.token[i].address))
                token.push(assets.token[i]);
        }

        return res.status(200).json({assets: {nft: nft, token: token}});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}