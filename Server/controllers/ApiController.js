const fs = require("fs").promises;
const Users = require('../models/users');
const Validations = require('../models/validations');
const Transfer = require('../models/transfer');
const Constants = require('../config/constants');
const Config = require('../config/config');
const Email = require('../repositories/EmailRepository');
const SmartRepository = require("../repositories/SmartRepository");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


let lastBlock = process.env.VERIFIER_BLOCK;

/**
 * Api Controller
 */

exports.methodNotFound = function (req, res) {
    return res.status(404).json({ msg: 'Method not found' })
}

exports.sayHello = function (req, res) {
    return res.status(200).json({ message: 'Hello transactions' })
}

exports.getVerifierEvents = async function (req, res) {
    try {
        const result = await SmartRepository.getEvents(Config.verifierContractData, lastBlock, 'latest', 'Transfer');
        lastBlock = await SmartRepository.getBlockNumber();

        for(let process of result) {
            let validation = new Validations();

            validation.from = process.returnValues.from;
            validation.to = process.returnValues.to;
            validation.token = process.returnValues.token;
            validation.amount = process.returnValues.value;
            validation.process = process.returnValues.process;
            validation.type = "ERC20"
            validation.isVault = true

            validation.save();
        }

        return res.status(200).json({result});
    } catch (e) {
        return res.status(500).json({ e })
    }
}

exports.validateTransfer = async function (req, res) {
    try {
        //const user = await Users.findOne({'username': req.user.username});
        //let validation = await Validations.findOne({'from': user.address, 'process': req.body.process})
        let validation = await Validations.findOne({'token': req.body.token, 'process': req.body.process})

        if(validation) {
            SmartRepository.validation(Config.nftContractData, 'validate', [req.body.process]);
            validation.validated = true;
            validation.save();

            return res.status(200).json({validation});
        } else {
            return res.status(500).json({message:"Process not found"});
        }
    } catch (e) {
        return res.status(500).json({ e })
    }
}

exports.getLastTransactionURL = async function (req, res) {
    try{
        const transfer = await Transfer.findOne({}, {}, { sort: { 'created_at' : -1 } });

        return res.status(200).json({url: "https://sepolia.etherscan.io/tx/" + transfer.hash});
    } catch (e) {
        return res.status(500).json({ e })
    }
}

exports.modifyAddress = async function (req, res) {
    try {
        let user = await Users.findOne({'username': req.user.username});
        user.address = req.body.address;
        user.save()

        return res.status(200).json({user});
    } catch (e) {
        return res.status(500).json({ e })
    }
}

exports.getMyTransfers = async function (req, res) {
    try {
        const user = await Users.findOne({'username': req.user.username});
        const transfers = await Validations.find({'from': user.address})

        return res.status(200).json({transfers});
    } catch (e) {
        console.error(e)
        return res.status(500).json({ e })
    }
}

exports.getStatusValidation = async function (req, res) {
    try {
        const transfer = await Validations.findOne({'token':req.query.token, 'process':req.query.process});

        return res.status(200).json({valid: transfer.validated});
    } catch (e) {
        console.error(e)
        return res.status(500).json({ e })
    }
}
