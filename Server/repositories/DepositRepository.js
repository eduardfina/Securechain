const {promises: fs} = require("fs");
const Deposits = require("../models/deposits");

exports.addDeposit = async function (hash) {
    if(exports.existsDeposit(hash)) throw Error("The transaction already exists!")

    let deposit = new Deposits();

    deposit.hash = hash;
    deposit.save();

    return deposit;
}

exports.existsDeposit = async function (hash) {
    const deposit = Deposits.findOne({hash: hash});

    return !!deposit;
}