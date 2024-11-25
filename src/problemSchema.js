import mongoose from 'mongoose';

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
    examples: [String],
    testCases: [
        {
            input: {
                type: String,
            },
            output: {
                type: String,
            }
        }
    ],
});

export const Problem = mongoose.model('problem', problemSchema);
