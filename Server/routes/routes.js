const express = require('express')

const AuthController = require('../controllers/AuthController')
const UserController = require("../controllers/UserController")
const ContractController = require("../controllers/ContractsController");
const ValidationController = require("../controllers/ValidationController");

module.exports = function (app) {
    const api = express.Router()

    // Auth Zone //
    api.post('/register', AuthController.register)
    api.post('/login', AuthController.login)
    api.post('/isLoggedIn', AuthController.isLoggedIn)

    // Private Zone //
    api.post('/changePassword', AuthController.isLoggedIn, UserController.changePassword);
    api.post('/setAddress', AuthController.isLoggedIn, UserController.setAddress);
    api.post('/modifyInfo', AuthController.isLoggedIn, UserController.modifyInfo);
    api.post('/acceptValidation', AuthController.isLoggedIn, ValidationController.acceptValidation);
    api.post('/closeValidation', AuthController.isOracleAuth, ValidationController.closeValidation);

    // Public Zone //
    api.get('/getProfileInfo', UserController.getProfileInfo);
    api.post('/depositCrypto', UserController.depositCrypto);
    api.get('/getUserAssets', ContractController.getUserAssets);
    api.post('/createContract', ContractController.createContract);
    api.get('/isValid', ValidationController.isValid);
    api.post('/estimateCostAcceptValidation', ValidationController.estimateCostAcceptValidation);
    api.post('/generate', AuthController.generateOracleToken);

    // Error fallback //
    api.get('*', AuthController.methodNotFound)

    // Use router
    app.use('/', api)
}
