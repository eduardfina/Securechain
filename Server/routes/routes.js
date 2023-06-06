const express = require('express')

const AuthController = require('../controllers/AuthController')
const UserController = require("../controllers/UserController")
const ContractController = require("../controllers/ContractsController");
const ValidationController = require("../controllers/ValidationController");
const PermissionController = require("../controllers/PermissionController");

module.exports = function (app) {
    const api = express.Router()

    // Auth Zone //
    api.post('/register', AuthController.register)
    api.post('/login', AuthController.login)
    api.post('/isLoggedIn', AuthController.isLoggedIn)

    // Private Zone //
    api.get('/getUserByAuth', AuthController.isLoggedIn, UserController.getUserByAuth);
    api.post('/changePassword', AuthController.isLoggedIn, UserController.changePassword);
    api.post('/setAddress', AuthController.isLoggedIn, UserController.setAddress);
    api.post('/modifyInfo', AuthController.isLoggedIn, UserController.modifyInfo);
    api.get('/getMyValidations', AuthController.isLoggedIn, ValidationController.getMyValidations);
    api.post('/acceptValidation', AuthController.isLoggedIn, ValidationController.acceptValidation);
    api.post('/closeValidation', AuthController.isOracleAuth, ValidationController.closeValidation);
    api.post('/denyPermission', AuthController.isLoggedIn, PermissionController.denyPermission);
    api.post('/sendNFT', AuthController.isLoggedIn, PermissionController.sendNFT);
    api.post('/sendToken', AuthController.isLoggedIn, PermissionController.sendToken);
    api.get('/getMyAssets', AuthController.isLoggedIn, ContractController.getMyAssets);
    api.get('/getMySecuredAssets', AuthController.isLoggedIn, ContractController.getMySecuredAssets);

    // Public Zone //
    api.get('/getProfileInfo', UserController.getProfileInfo);
    api.post('/depositCrypto', UserController.depositCrypto);
    api.get('/getUserAssets', ContractController.getUserAssets);
    api.post('/createContract', ContractController.createContract);
    api.get('/isValid', ValidationController.isValid);
    api.post('/generate', AuthController.generateOracleToken);
    api.get('/getContractFromOriginalAddress', ContractController.getContractFromOriginalAddress);
    api.get('/getPermission', PermissionController.getPermission);
    api.get('/getTransactions', PermissionController.getTransactions);

    // Error fallback //
    api.get('*', AuthController.methodNotFound)

    // Use router
    app.use('/', api)
}
