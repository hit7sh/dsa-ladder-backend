
import fs from 'fs';

import express from 'express';
import cors from 'cors';

const username = process.env.mongo_username;
const password = process.env.mongo_password;

// database connection 
import { mongoose } from 'mongoose';
import { User } from './userSchema.js';
import { Problem } from './problemSchema.js';
import { runCode, submitCode } from './evaluateCode.js';

mongoose
    .connect(`mongodb+srv://${username}:${password}@cluster0.krn4y5n.mongodb.net/dsa-ladder`)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log({ MongoConnectError: err }));
// ---


const allowedOrigin = 'https://dsa-ladder.vercel.app';

const corsOptions = {
    origin: (origin, callback) => {
        if (origin === allowedOrigin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};

const app = express();

// app.use(cors(corsOptions));
app.use(cors());
app.options('*', cors());
app.use(express.json());


const insertUserWithTime = async ({ email }) => {
    const userData = {
        email,
        time: new Date().toLocaleString('en-GB', {
            timeZone: 'Asia/Kolkata',  // IST time zone
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }),
    };

    try {
        await User.findOneAndUpdate(
            { email },  // Search for existing document by email
            { $set: userData },         // Update the document or insert new one
            { new: true, upsert: true } // If no document found, insert new one
        );
    } catch (err) {
        console.log({ mongoInsertErr: err });
    }
}

const getTestCases = async ({ title }) => {
    try {
        return await Problem.findOne(
            { title },
            { testCases: 1, _id: 0 },
        )
    } catch (err) {
        return { err };
    }
};


export const TMP_DIR = '/tmp/code-files';
fs.mkdirSync(TMP_DIR, { recursive: true });

app.post('/log-user', async (req, res) => {
    const { userEmail: email } = req.body;
    await insertUserWithTime({ email });
    res.json({ message: 'Success' });
});


app.post('/run', async (req, res) => {
    const { code, language, inputText = '', } = req.body;
    runCode({ res, code, inputText, language, })
});

app.post('/submit', async (req, res) => {
    const { code, language, problemTitle, } = req.body;
    const { testCases } = await getTestCases({ title: problemTitle });

    if (!testCases) {
        res.json({ error: 'Internal Server Error' });
    } else {

        await submitCode({ res, code, language, testCases });
    }

});

app.post('/add-problem', async (req, res) => {
    const { newProblem } = req.body;
    try {
        await Problem.insertOne(newProblem);
    } catch (err) {
        console.log('could not add problem to DB');
    }
})

app.get('/problems', async (req, res) => {
    try {
        const problems = await Problem.find({}, { testCases: 0 });
        res.send(problems);
    } catch (err) {
        res.status(500).send({ error: 'db error' });
    }
})

app.listen(3000, () => console.log('Server listening on port 3000'));
