const {promises: fs} = require("fs");
const Users = require("../models/users");
const bcrypt = require("bcryptjs");

exports.addUser = async function (username, name, lastName, password, email) {
    if(await Users.exists({username: username})) throw Error("Username already taken!");
    if(await Users.exists({email: email})) throw Error("Email already in use!");

    let user = new Users();

    user.username = username;
    user.name = name;
    user.lastName = lastName;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);

    user.save();

    return user;
}

exports.getUser = async function (username) {
    const user = await Users.findOne({username: username});
    if(!user) throw Error("User not found!");

    return user;
}

exports.getUserByAddress = async function (address) {
    const user = await Users.findOne({address: address});
    if(!user) throw Error("User not found!");

    return user;
}

exports.checkPassword = async function (username, password) {
    const user = await Users.findOne({username: username});

    if (!user) throw Error("User not found");

    const result = await bcrypt.compare(password, user.password);

    return !!result;
}

exports.modifyInfo = async function (username, info, value) {
    let user = await Users.findOne({'username': username});

    if (!user) throw Error("User not found");

    if(info === "name") user.name = value;
    else if(info === "lastName") user.lastName = value;
    else if(info === "email") user.email = value;
    else if(info === "password") user.password = value;
    else if(info === "address") user.address = value;

    user.save();

    return true;
}

exports.addBalance = async function (username, value) {
    let user = await Users.findOne({'username': username});

    if (!user) throw Error("User not found");

    user.balance += value;
    user.save();

    return user.balance;
}

exports.substractBalance = async function (username, value) {
    let user = await Users.findOne({'username': username});

    if (!user) throw Error("User not found");
    if (user.balance < value) throw Error("Not enough balance");

    user.balance += value;
    user.save();

    return user.balance;
}

exports.existsUsername = async function (username) {
    return Users.exists({username: username});
}

exports.existsEmail = function (email) {
    return Users.exists({email: email});
}

exports.existsAddress = function (address) {
    return Users.exists({address: address});
}