const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    time: {
        type: String,
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;