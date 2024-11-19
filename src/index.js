const shell = require('shelljs')
const fs = require('fs');

const path = require('path');
const { v4: uuidv4 } = require('uuid');

const express = require('express')
const cors = require('cors');


// database connection 
const mongoose = require('mongoose');
const User = require('./userSchema');
const Problem = require('./problemSchema');
mongoose
    .connect('mongodb://database:27017/dsa-ladder')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log({ MongoError: err }));
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


const TMP_DIR = '/tmp/cpp_files';
fs.mkdirSync(TMP_DIR, { recursive: true });

const runCppCode = async ({ res, code, inputText, }) => {
    const fileId = uuidv4();
    const cppFilePath = path.join(TMP_DIR, `${fileId}.cpp`);
    const inputFilePath = path.join(TMP_DIR, `${fileId}.txt`);
    const executablePath = path.join(TMP_DIR, fileId);

    // Write code to a .cpp file
    fs.writeFileSync(cppFilePath, code);
    fs.writeFileSync(inputFilePath, inputText);


    // Compile the C++ code
    shell.exec(`g++ -o ${executablePath} ${cppFilePath}`, (compileErr, stdout, stderr) => {
        let output = null;
        let compileErrors = null;
        let runtimeErrors = null;

        if (compileErr) {
            compileErrors = stderr;
            if (compileErrors) {
                // Send compile errors immediately and skip runtime execution
                res.json({ output, compile_errors: compileErrors, runtime_errors: runtimeErrors });
                shell.exec(`rm ${cppFilePath} ${inputFilePath} ${executablePath}`);
            }
        } else {
            // Run the executable if compiled successfully
            shell.exec(`${executablePath} < ${inputFilePath} && rm -rf ${cppFilePath} ${inputFilePath} ${executablePath}`, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
                output = runStdout;
                runtimeErrors = runStderr || (runErr ? runErr.message : null);
                res.json({ output, compile_errors: compileErrors, runtime_errors: runtimeErrors });
            });
        }
    });
}

app.post('/run', async (req, res) => {
    const { code, language, inputText = '', userEmail: email } = req.body;

    if (email)
        await insertUserWithTime({ email });

    // if (language === 'c_cpp')
    await runCppCode({ res, code, inputText });
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
