const bcrypt = require('bcryptjs');
const Config = require("../config/config");
const SmartRepository = require("../repositories/SmartRepository");
const UserRepository = require('../repositories/UserRepository');
const DepositRepository = require("../repositories/DepositRepository");

/**
 * User Controller
 */

exports.getProfileInfo = async function (req, res) {
    try {
        const params = req.query;

        if (!params.username) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(params.username);

        return res.status(200).json({username: user.username, name: user.name, lastName: user.lastName, address: user.address, email: user.email, balance: user.gasBalance});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.changePassword = async function (req, res) {
    try {
        const params = req.body;
        const username = req.user.username;

        if (!params.oldPassword || !params.newPassword) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const result = await UserRepository.checkPassword(username, params.oldPassword);

        if (!result) return res.status(400).json({error: "Invalid password!"});

        const newPassword = await bcrypt.hash(params.newPassword, 10);
        await UserRepository.modifyInfo(username, "password", newPassword);

        return res.status(200).json({message: "Password changed successfully!"})
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.setAddress = async function(req, res) {
    try {
        const params = req.body;
        const username = req.user.username;

        if (!params.newAddress) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        if (await UserRepository.existsAddress(params.newAddress)) {
            return res.status(400).json({error: "Address already in use!"});
        }

        await UserRepository.modifyInfo(username, "address", params.newAddress);

        return res.status(200).json({message: "Address changed!"})
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.modifyInfo = async function (req, res) {
    try {
        const params = req.body;
        const username = req.user.username;

        if (!params.name || !params.lastName || !params.email) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(username);

        if (user.name !== params.name) {
            await UserRepository.modifyInfo(username, "name", params.name);
        }
        if (user.lastName !== params.lastName) {
            await UserRepository.modifyInfo(username, "lastName", params.lastName);
        }
        if (user.email !== params.email) {
            if(await UserRepository.existsEmail(params.email)) {
                return res.status(400).json({error: "Email already in use!"});
            }

            await UserRepository.modifyInfo(username, "email", params.email);
        }

        return res.status(200).json({message: "User updated!"});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.depositCrypto = async function (req, res) {
    try {
        const params = req.body;

        if (!params.username || !params.hash) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        if (await DepositRepository.existsDeposit(params.hash)) {
            return res.status(400).json({error: "The deposit already exists!"})
        }

        const user = await UserRepository.getUser(params.username);

        const result = await SmartRepository.getTransaction(params.hash);

        if(result.from !== user.address || result.to !== Config.account.address || result.value === "0") {
            return res.status(400).json({error: "Wrong hash or address"})
        }

        const balance = await UserRepository.addBalance(params.username, result.value);

        await DepositRepository.addDeposit(params.hash);

        return res.status(200).json({message: "Deposit done successfully!", balance: balance})
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.getUserBalance = async function (req, res) {
    try{
        const params = req.query;

        if (!params.username) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(params.username);

        return res.status(200).json({balance: user.balance});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.getUserAddress = async function (req, res) {
    try{
        const params = req.query;

        if (!params.username) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(params.username);

        return res.status(200).json({address: user.address});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.getUserName = async function (req, res) {
    try {
        const params = req.query;

        if (!params.username) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(params.username);

        return res.status(200).json({name: user.name + " " + user.lastName});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.existsUsername = async function (req, res) {
    try {
        const params = req.query;

        if (!params.username) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const exists = await UserRepository.existsUsername(params.username);

        return res.status(200).json({exists: exists});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.existsEmail = async function (req, res) {
    try {
        const params = req.query;

        if (!params.email) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const exists = await UserRepository.existsEmail(params.email);

        return res.status(200).json({exists: exists});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.existsAddress = async function (req, res) {
    try {
        const params = req.query;

        if (!params.address) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const exists = await UserRepository.existsAddress(params.address);

        return res.status(200).json({exists: exists});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}