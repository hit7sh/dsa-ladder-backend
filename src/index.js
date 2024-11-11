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
    const { code, language } = req.body;
    console.log({ code });

    try {
        await fs.writeFile(`./cpp/code/runtime_errors.txt`, '');
        await fs.writeFile(`./cpp/code/compile_errors.txt`, '');
        await fs.writeFile(`./cpp/code/index.cpp`, code);
    } catch (err) {
        console.log({ 'duringWrite': err });
        return res.status(200).send({ error: 'cpp file write failed' });
    }

    shell.exec('cd ~/dsa-ladder-backend/cpp && npm run exec', { async: true }, async (e, stdout) => {
        const compile_errors = fs.readFile('./cpp/code/compile_errors.txt', 'utf-8');
        if (compile_errors?.length)
            return res.json({ compile_errors });

        const runtime_errors = await fs.readFile('./cpp/code/runtime_errors.txt', 'utf-8');
        if (runtime_errors?.length)
            return res.json({ runtime_errors });

        const data = await fs.readFile('./cpp/code/output.txt', 'utf8');
        return res.json({ output: data });
    });
});

app.listen(3000, () => console.log('Server listening on port 3000'));
