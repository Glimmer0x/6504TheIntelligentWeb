const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema(
    {
        username: {type: String, required: true, max: 100, unique: true},
        password: {type: String, required: true, max: 100},
        date:{type: Date, default: Date.now()}
    }
);


User.set('toObject', {getters: true});

module.exports = mongoose.model('Users', User);
