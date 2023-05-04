const mongoose = require('mongoose');


// define the schema for our user model
const Schema = mongoose.Schema(
    {
        address: {type: String, unique: true},
        originalAddress: String,
        type: {type: String, enum: ["ERC20", "ERC721"]}
    }
);


// create the model for users and expose it to our app
module.exports = mongoose.model('Contracts', Schema);

