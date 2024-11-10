const exec = require('child_process').exec;
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
    console.log(req.body);
    const { code } = req.body;
    exec('cd ~/projects/dsa-ladder-backend/cpp && npm run start', (e, stdout) => console.log({ stdout }))
    res.send('done')
})

app.listen(3000, () => console.log('Server running on port 3000'));