const shell = require('shelljs')
const fs = require('fs');
const readline = require('readline');

const express = require('express')
const cors = require('cors');
const { stdout } = require('process');

const app = express();

app.use(cors({ origin: 'https://dsa-ladder.vercel.app' }));
app.use(express.json());

app.post('/run', async (req, res) => {
    const { code } = req.body;
    console.log({ code });
    fs.writeFile(`./cpp/code/index.cpp`, code, (err) => {
        if (err) {
            console.log({ 'duringWrite': err });
            return res.status(200).send({ error: 'cpp file write failed' });
        }
        shell.exec('cd ~/dsa-ladder-backend/cpp && npm run exec', { async: true }, (e, stdout) => {
            fs.readFile('./cpp/code/output.txt', 'utf8', (err, data) => {
                if (err) return res.status(200).send({ error: 'Something wrong happened1' });
                return res.json({ output: data });
            });
        });
    });
});

app.listen(3000, () => console.log('Server listening on port 3000'));
