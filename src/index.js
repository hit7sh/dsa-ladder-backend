const shell = require('shelljs')
const fs = require('fs').promises;

const express = require('express')
const cors = require('cors');

const mongoose = require('mongoose');
const { User } = require('./userSchema');

const app = express();


// data base connection 
mongoose
    .connect('mongodb://localhost:27017/dsa-ladder')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log({ MongoError: err }));
// ---


app.use(cors());
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

app.post('/run', async (req, res) => {
    const { code, inputText = '', language, email } = req.body;
    console.log({ code });
    await User.create({ email, time: new Date().toString() });

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

app.listen(3000, () => console.log('Server listening on port 3000'));
