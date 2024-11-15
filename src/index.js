const shell = require('shelljs')
const fs = require('fs').promises;
const readline = require('readline');

const express = require('express')
const cors = require('cors');
const { stdout } = require('process');

const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json());

app.post('/run', async (req, res) => {
    const { code, inputText = '', language } = req.body;
    console.log({ code });
    let base_url = '', docker_image = '', code_extension = '';
    if (language === 'c_cpp') {
        base_url = '~/dsa-ladder-backend/cpp/code';
        docker_image = 'gcc';
        code_extension = 'cpp';
    }
    else if (language === 'python') {
        base_url = '~/dsa-ladder-backend/python/code'
        docker_image = 'python';
        code_extension = 'py';
    }
    else if (language === 'javascript') {
        base_url = '~/dsa-ladder-backend/nodejs/code'
        docker_image = 'node';
        code_extension = 'js';
    }
    else if (language === 'java') {
        base_url = '~/dsa-ladder-backend/java/code';
        docker_image = 'openjdk';
        code_extension = 'java';
    }

    try {
        await fs.writeFile(`${base_url}/runtime_errors.txt`, '');
        await fs.writeFile(`${base_url}/compile_errors.txt`, '');
        await fs.writeFile(`${base_url}/output.txt`, '');
        await fs.writeFile(`${base_url}/index.${code_extension}`, code);
        await fs.writeFile(`${base_url}/input.txt`, inputText);
    } catch (err) {
        console.log({ 'duringWrite': err });
        return res.status(200).send({ error: 'cpp file write failed' });
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
