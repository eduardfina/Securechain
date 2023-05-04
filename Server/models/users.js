const mongoose = require('mongoose');


// define the schema for our user model
const Schema = mongoose.Schema(
    {
        username: {type: String, unique: true},
        name: String,
        lastName: String,
        email: {type: String, unique: true},
        verifiedEmail: {type: Boolean, default: false},
        address: {type: String, unique: true},
        password: String,
        balance: {type: Number, default: 0}
    }
);


// create the model for users and expose it to our app
module.exports = mongoose.model('Users', Schema);

