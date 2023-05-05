const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const UserRepository = require('../repositories/UserRepository');

/**
 * Auth Controller
 */

exports.methodNotFound = function (req, res) {
    return res.status(404).json({ msg: 'Method not found' })
}

exports.register = async function (req, res) {
    try {
        const params = req.body;

        if(!params.username || !params.name || !params.lastName || !params.email || !params.password) {
            return res.status(401).json({error: "Missing Parameters"});
        }

        const user = await UserRepository.addUser(params.username, params.name, params.lastName, params.password, params.email);

        return res.status(200).json({user});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.login = async function (req, res) {
    try {
        const params = req.body;

        if(!params.username || !params.password) {
            return res.status(401).json({message: "Missing Parameters"});
        }

        const user = await UserRepository.getUser(params.username);

        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) return res.status(400).json({ error: "Password doesn't match" });

        const token = await jwt.sign({ username: user.username }, process.env.SECRET);

        return res.status(200).json({token: token});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.isLoggedIn = async function (req, res, next) {
    try {
        if (!req.headers.authorization) return res.status(400).json({ error: "No authorization header" });

        const token = req.headers.authorization.split(" ")[1]; //split the header and get the token
        if (!token) return res.status(400).json({ error: "Malformed auth header" });

        const payload = await jwt.verify(token, process.env.SECRET);
        if (!payload) return res.status(400).json({ error: "Token verification failed" });

        req.user = payload;
        next();
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.generateOracleToken = async function (req, res) {
    try {
        const token = await jwt.sign({ username: 'oracle' }, process.env.SECRET);

        return res.status(200).json({token: token});
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}

exports.isOracleAuth = async function (req, res, next) {
    try {
        if (!req.headers.authorization) return res.status(400).json({ error: "No authorization header" });

        const token = req.headers.authorization.split(" ")[1]; //split the header and get the token
        if (!token) return res.status(400).json({ error: "Malformed auth header" });

        const payload = await jwt.verify(token, process.env.SECRET);
        if (!payload) return res.status(400).json({ error: "Token verification failed" });

        if(payload.username !== 'oracle')
            return res.status(400).json({error: "You are not an oracle"});

        next();
    } catch (e) {
        return res.status(500).json({error: e.message})
    }
}