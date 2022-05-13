const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Users = new Schema(
    {
        username: {type: String, required: true, max: 100, unique: true},
        password: {type: String, required: true, max: 100},
        date:{type: Date, default: Date.now()}
    }
);


Users.set('toObject', {getters: true});

module.exports = mongoose.model('Users', Users);
