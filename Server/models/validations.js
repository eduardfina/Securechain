const mongoose = require('mongoose');


// define the schema for our user model
const Schema = mongoose.Schema(
    {
        contract: {type: mongoose.Schema.Types.ObjectId, ref: 'Contracts'},
        process: Number,
        type: {type: String, enum: ["Downgrade", "Transfer", "Approve", "ApproveAll"]},
        owner: String,
        to: String,
        token: Number,
        accept: {type: Boolean, default: false},
        active: {type: Boolean, default: true}
    }
);


// create the model for users and expose it to our app
module.exports = mongoose.model('Validations', Schema);

