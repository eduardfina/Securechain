const mongoose = require('mongoose');


// define the schema for our user model
const Schema = mongoose.Schema(
    {
            hash: String,
            functionName: String,
            args: String,
            created: {type: Date, default: new Date()}
    }
);


// create the model for users and expose it to our app
module.exports = mongoose.model('Transfer', Schema);
