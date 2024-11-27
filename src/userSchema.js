import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    time: {
        type: String,
    },
    solvedProblems: {
        type: [String], // Array of strings
        default: [],
    },
});

export const User = mongoose.model('user', userSchema);
