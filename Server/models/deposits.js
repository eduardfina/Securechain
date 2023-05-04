const mongoose = require('mongoose');


// define the schema for our user model
const Schema = mongoose.Schema(
    {
            hash: {type: String, unique: true}
    }
);


// create the model for users and expose it to our app
module.exports = mongoose.model('Deposit', Schema);
