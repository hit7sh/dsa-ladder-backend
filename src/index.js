const shell = require('shelljs')
const fs = require('fs');
const readline = require('readline');

const express = require('express')
const cors = require('cors');
const { stdout } = require('process');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/run', async (req, res) => {
    const { code } = req.body;
    console.log({ code });
    fs.writeFile(`../cpp/code/index.cpp`, code, (err) => {
        if (err) {
            console.log(`❌ . FAILED`);
        }
    });
    shell.exec('cd ~/dsa-ladder-backend/cpp && npm start', { async: true }, (e, stdout) => {
        try {
            const file = readline.createInterface({
                input: fs.createReadStream('../cpp/code/output.txt'),
                output: process.stdout,
                terminal: false
            });

            file.on('line', (line) => {
                console.log(line);
            });
        } catch (err) {
            console.log(`❌  FAILED`);
        }
        res.send('done')

    });
});

app.listen(3000, () => console.log('Server listening on port 3000'));