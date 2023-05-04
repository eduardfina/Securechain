const Web3 = require('web3')
const Transfer = require('../models/transfer')
const Config = require('../config/config.js')
const web3 = new Web3(new Web3.providers.HttpProvider(Config.network.host))
const account = web3.eth.accounts.privateKeyToAccount(Config.account.pk);
web3.eth.accounts.wallet.add(account)

console.log(`Caller account read successfully: ${account.address}`)

exports.getBlockNumber = function () {
    return web3.eth.getBlockNumber()
}
exports.getTransactionStatus = function (hash) {
    return web3.eth.getTransactionReceipt(hash)
}
exports.getTransaction = function (hash) {
    return web3.eth.getTransaction(hash)
}
exports.getBN = function () {
    return web3.utils.BN
}
exports.createWallet = function () {
    return web3.eth.accounts.create()
}
exports.getWallet = function (pk) {
    return web3.eth.accounts.privateKeyToAccount(pk)
}
exports.getActualAccount = function () {
    return account
}
exports.validAddress = function (address) {
    return web3.utils.isAddress(address);
}
exports.getGasPrice = function () {
    return web3.eth.getGasPrice();
}
exports.getGasLimit = async function () {
    const block = await web3.eth.getBlock("latest");
    return block.gasLimit;
}
exports.juelsToLink = function (juels) {
    return web3.utils.formatUnits(juels, 18);
}
exports.call= async function (contractData,functionName,args){
    let contract = new web3.eth.Contract(
        contractData.abi,
        contractData.address
    )
    return await contract.methods[functionName].apply(null, args).call({from: "0x0000000000000000000000000000000000000000"});
}
exports.transaction = async function (contractData, functionName, args, amount = '0') {
    let contract = new web3.eth.Contract(contractData.abi, contractData.address)
    let transaction = await contract.methods[functionName].apply(null, args)
    const nonce = await web3.eth.getTransactionCount(account.address, 'pending')
    return new Promise(async (resolve, reject) => {
        try {
            let options = {
                from: account.address,
                to: transaction._parent._address,
                data: transaction.encodeABI(),
                value: amount.toString(),
                nonce: nonce,
            }

            options.gas = Math.trunc((await transaction.estimateGas(options)) * 1.2)
            const signedTransaction = await web3.eth.accounts.signTransaction( options, Config.account.pk )
            const rawTransaction = web3.eth.sendSignedTransaction( signedTransaction.rawTransaction )

            rawTransaction.on('transactionHash', (hash) => {
                const trns = new Transfer();
                trns.hash = hash;
                trns.functionName = functionName;
                trns.args = JSON.stringify(args);
                trns.save().then(() => {
                    resolve(hash)
                }).catch((error) => {
                    reject(error)
                })
            })

            rawTransaction.on('error', (error) => {
                console.log("ERROR")
                reject(error)
            })
        } catch (e) {
            reject({ message: e.message, data: e.data })
        }
    })
}

exports.getEvents = async function (contractData, from, to, event) {

    let contract = new web3.eth.Contract(contractData.abi, contractData.address)

    let options = {
        fromBlock: from,                  //Number || "earliest" || "pending" || "latest"
        toBlock: to
    };

    return await contract.getPastEvents(event, options);
}

exports.hasMethod = async function (contractAddress, signature) {
    const code = await web3.eth.getCode(contractAddress);
    const functionSignature = web3.eth.abi.encodeFunctionSignature(signature);

    return code.indexOf(functionSignature.slice(2, functionSignature.length)) > 0;
}