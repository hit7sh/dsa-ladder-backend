const mongoose = require('mongoose')

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
    },
    description: {
        type: String,
    },
    problemStatement: {
        type: String,
    },
    constraints: {
        type: String,
    },
    examples: [string]
});

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;
