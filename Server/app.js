/**
 * Node.js Login Boilerplate
 * More Info : http://kitchen.braitsch.io/building-a-login-system-in-node-js-and-mongodb/
 * Copyright (c) 2013-2016 Stephen Braitsch
 **/
// Read params
let prevArg = ''
process.socket = false
for (const arg of process.argv) {
    if (prevArg === 'cron') {
        process.cron = arg
    }
    if (arg === '--socket') {
        process.socket = true
    }
    if (prevArg === '--network') {
        process.network = arg
    }
    if (prevArg === '--port') {
        process.port = parseInt(arg)
    }
    prevArg = arg
}
// Read config
const config = require('./config/config.js')
// Set up database connection
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_DSN, {user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DATABASE,
    useUnifiedTopology: true, useNewUrlParser: true});
mongoose.connection.on('error', function (err) {
    console.log(err.message);
    process.exit(1);
});

module.exports = require('./server')(config)


mongoose.connection.once('open', function () {
    console.log('DB Connected!')
    module.exports.emit("app_started")
});

var listenEvents = require("./events/ListenEvents");

listenEvents.main();