import shell from 'shelljs';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';


import { TMP_DIR } from './index.js';

export const runCppCode = async ({ res, code, inputText, validate = false }) => {
    try {
        const fileId = uuidv4();
        const cppFilePath = path.join(TMP_DIR, `${fileId}.cpp`);
        const inputFilePath = path.join(TMP_DIR, `${fileId}.txt`);
        const executablePath = path.join(TMP_DIR, fileId);

        // Write code to a .cpp file
        fs.writeFileSync(cppFilePath, code);
        fs.writeFileSync(inputFilePath, inputText);


        // Compile the C++ code
        const { stderr } = await shell.exec(`g++ -o ${executablePath} ${cppFilePath}`);

        if (stderr) {
            shell.exec(`rm ${cppFilePath} ${inputFilePath} ${executablePath}`);
            return { output: '', compile_errors: stderr, runtime_errors: '' };
        }
        const { stdout, stderr: runtime_errors, code: timed_out } = await shell.exec(`${executablePath} < ${inputFilePath}`, { timeout: 2000 });
        shell.exec(`rm ${cppFilePath} ${inputFilePath} ${executablePath}`);

        if (runtime_errors) {
            return { output: '', compile_errors: '', runtime_errors };
        }
        if (timed_out) {
            return { output: '', compile_errors: '', runtime_errors: 'TLE', };
        }
        return { output: stdout, compile_errors: '', runtime_errors: '' };
    }
    catch (err) {
        return { output: '', compile_errors: '', runtime_errors: err }
    }
}

export const runJavaCode = async ({ res, code, inputText, validate = false }) => {
    try {
        const fileId = 'C' + Math.floor(Math.random() * 999999);
        const javaFilePath = path.join(TMP_DIR, `${fileId}.java`);
        const inputFilePath = path.join(TMP_DIR, `${fileId}.txt`);
        const execFilePath = path.join(TMP_DIR, `${fileId}`);

        fs.writeFileSync(javaFilePath, code.replace(/MainClass/g, fileId));
        fs.writeFileSync(inputFilePath, inputText);

        const { stderr } = await shell.exec(`cd ${TMP_DIR} && javac ${fileId}.java`);
        if (stderr) {
            shell.exec(`rm ${javaFilePath} ${inputFilePath} ${execFilePath}.class`);
            return { output: '', compile_errors: stderr, runtime_errors: '' };
        }

        const { stdout, stderr: runtime_errors, code: timed_out } = await shell.exec(`cd ${TMP_DIR} && java ${fileId} < ${fileId}.txt`, { timeout: 2000 });
        shell.exec(`rm ${javaFilePath} ${inputFilePath} ${execFilePath}.class`);

        if (runtime_errors) {
            return { output: '', compile_errors: '', runtime_errors };
        }

        if (timed_out) {
            return { output: '', compile_errors: '', runtime_errors: 'TLE', };
        }

        return { output: stdout, compile_errors: '', runtime_errors: '' };
    }
    catch (err) {
        return { output: '', compile_errors: '', runtime_errors: err }
    }
}


export const runPythonCode = async ({ res, code, inputText, }) => {
    try {
        const fileId = uuidv4();
        const pythonFilePath = path.join(TMP_DIR, `${fileId}.py`);
        const inputFilePath = path.join(TMP_DIR, `${fileId}.txt`);

        fs.writeFileSync(pythonFilePath, code);
        fs.writeFileSync(inputFilePath, inputText);

        const { stdout, stderr, code: timed_out } = await shell.exec(`python3 ${pythonFilePath} < ${inputFilePath}`, { timeout: 2000 });

        shell.exec(`rm ${pythonFilePath} ${inputFilePath}`);
        if (stderr) {
            return { output: '', compile_errors: stderr, runtime_errors: '' }
        }
        if (timed_out) {
            return { output: '', compile_errors: '', runtime_errors: 'TLE', };
        }
        return { output: stdout, compile_errors: '', runtime_errors: '' };
    } catch (err) {
        return { output: '', compile_errors: '', runtime_errors: err }
    }
}

export const runNodejsCode = async ({ res, code, inputText, }) => {
    try {
        const fileId = uuidv4();
        const nodejsFilePath = path.join(TMP_DIR, `${fileId}.js`);
        const inputFilePath = path.join(TMP_DIR, `${fileId}.txt`);

        fs.writeFileSync(nodejsFilePath, code);
        fs.writeFileSync(inputFilePath, inputText);

        const { stdout, stderr, code: timed_out } = shell.exec(`node ${nodejsFilePath} < ${inputFilePath}`, { timeout: 2000 });

        shell.exec(`rm ${nodejsFilePath} ${inputFilePath}`);

        if (stderr) {
            return { output: '', compile_errors: stderr, runtime_errors: '' }
        }
        if (timed_out) {
            return { output: '', compile_errors: '', runtime_errors: 'TLE', };
        }
        return { output: stdout, compile_errors: '', runtime_errors: '' };

    } catch (err) {
        return { output: '', compile_errors: '', runtime_errors: err }
    }
}