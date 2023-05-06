const PermissionRepository = require("../repositories/PermissionRepository");
const UserRepository = require("../repositories/UserRepository");

/**
 * Permission Controller
 */

exports.getPermission = async function (req, res) {
    try {
        const params = req.query;

        if (!params.address) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const permission = await PermissionRepository.getPermission(params.address);

        return res.status(200).json({permission: permission});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.denyPermission = async function (req, res) {
    try {
        const user = await UserRepository.getUser(req.user.username);

        const permission = await PermissionRepository.getPermission(user.address);

        if(!permission)
            return res.status(400).json({error: "Permission already denied"});

        const transaction = await PermissionRepository.denyPermission(user.address);

        return res.status(200).json({transaction: transaction});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.sendNFT = async function (req, res) {
    try {
        const params = req.body;

        if (!params.to || !params.contractAddress || !params.token) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(req.user.username);

        const transaction = await PermissionRepository.sendNFT(user.address, params.to, params.contractAddress, params.token);

        return res.status(200).json({transaction: transaction});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.sendToken = async function (req, res) {
    try {
        const params = req.body;

        if (!params.toAddress || !params.contractAddress || !params.amount) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(req.user.username);

        const transaction = await PermissionRepository.sendTokens(user.address, params.toAddress, params.contractAddress, params.amount);

        return res.status(200).json({transaction: transaction});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.getTransactions = async function (req, res) {
    try {
        const params = req.query;

        if (!params.address) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const transactions = await PermissionRepository.getTransactions(params.address);

        return res.status(200).json({transactions: transactions});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}