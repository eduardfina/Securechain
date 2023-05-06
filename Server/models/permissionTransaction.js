const mongoose = require('mongoose');


// define the schema for our user model
const Schema = mongoose.Schema(
    {
        creator: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
        from: {type: String},
        to: {type: String},
        contract: {type: mongoose.Schema.Types.ObjectId, ref: 'Contracts'},
        token: {type: Number},
        hash: {type: String, unique: true},
        valid: {type: Boolean, default: false}
    }
);


// create the model for users and expose it to our app
module.exports = mongoose.model('PermissionTransaction', Schema);

