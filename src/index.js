const shell = require('shelljs')
const fs = require('fs').promises;

const express = require('express')
const cors = require('cors');
const allowedOrigin = 'https://dsa-ladder.vercel.app';

const corsOptions = {
    origin: allowedOrigin,
};

const mongoose = require('mongoose');
const User = require('./userSchema');
const Problem = require('./problemSchema');

const app = express();


// data base connection 
mongoose
    .connect('mongodb://localhost:27017/dsa-ladder')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log({ MongoError: err }));
// ---


app.use(cors(corsOptions));
app.options('*', cors());
app.use(express.json());

const getLanguageDetails = (language) => {
    let base_url = '', docker_image = '', code_extension = '';
    if (language === 'c_cpp') {
        base_url = './cpp/code';
        docker_image = 'gcc';
        code_extension = 'cpp';
    }
    else if (language === 'python') {
        base_url = './python/code'
        docker_image = 'python';
        code_extension = 'py';
    }
    else if (language === 'javascript') {
        base_url = './nodejs/code'
        docker_image = 'node';
        code_extension = 'js';
    }
    else if (language === 'java') {
        base_url = './java/code';
        docker_image = 'openjdk';
        code_extension = 'java';
    }
    return { base_url, docker_image, code_extension };
};
const clearErrorAndOutputFiles = async ({ base_url }) => {
    await fs.writeFile(`${base_url}/runtime_errors.txt`, '');
    await fs.writeFile(`${base_url}/compile_errors.txt`, '');
    await fs.writeFile(`${base_url}/output.txt`, '');
};
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

app.post('/run', async (req, res) => {
    const { code, inputText = '', language, email } = req.body;
    console.log({ code });

    await insertUserWithTime({ email });

    const { base_url, docker_image, code_extension } = getLanguageDetails(language);

    try {
        clearErrorAndOutputFiles({ base_url });
        await fs.writeFile(`${base_url}/index.${code_extension}`, code);
        await fs.writeFile(`${base_url}/input.txt`, inputText);
    } catch (err) {
        console.log({ 'duringWrite': err });
        return res.status(500).send({ error: 'cpp file write failed' });
    }

    shell.exec(`sh code-runner.sh ${docker_image}`, { async: true }, async (e, stdout) => {
        const compile_errors = await fs.readFile(`${base_url}/compile_errors.txt`, 'utf-8');

        if (compile_errors?.length)
            return res.json({ compile_errors });

        const runtime_errors = await fs.readFile(`${base_url}/runtime_errors.txt`, 'utf-8');
        if (runtime_errors?.length)
            return res.json({ runtime_errors });

        const data = await fs.readFile(`${base_url}/output.txt`, 'utf8');
        return res.json({ output: data });
    });
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
