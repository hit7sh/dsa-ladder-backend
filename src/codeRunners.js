import shell from 'shelljs';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';


import { TMP_DIR } from './index.js';

export const runCppCode = async ({ res, code, inputText, validate = false }) => {
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

export const runJavaCode = async ({ res, code, inputText, validate = false }) => {
    const fileId = 'C' + Math.floor(Math.random() * 999999);
    const javaFilePath = path.join(TMP_DIR, `${fileId}.java`);
    const inputFilePath = path.join(TMP_DIR, `${fileId}.txt`);
    const execFilePath = path.join(TMP_DIR, `${fileId}`);

    fs.writeFileSync(javaFilePath, code.replace(/MainClass/g, fileId));
    fs.writeFileSync(inputFilePath, inputText);

    shell.exec(`cd ${TMP_DIR} && javac ${fileId}.java`, (compileErr, stdout, stderr) => {
        let output = null;
        let runtimeErrors = null;

        if (compileErr) {
            res.json({ output, compile_errors: stderr, runtime_errors: runtimeErrors });
            shell.exec(`rm ${javaFilePath} ${inputFilePath}`);
        } else {
            // Run the compiled Java class, passing input through `<` redirection
            shell.exec(`cd ${TMP_DIR} && java ${fileId} < ${fileId}.txt`, (runtimeErr, stdout, stderr) => {
                output = stdout || null;
                runtimeErrors = stderr || null;
                res.json({ output, compile_errors: null, runtime_errors: runtimeErrors });

                shell.exec(`rm ${javaFilePath} ${inputFilePath} ${execFilePath}.class`);
            });
        }
    });
}


export const runPythonCode = async ({ res, code, inputText, }) => {
    const fileId = uuidv4();
    const pythonFilePath = path.join(TMP_DIR, `${fileId}.py`);
    const inputFilePath = path.join(TMP_DIR, `${fileId}.txt`);

    fs.writeFileSync(pythonFilePath, code);
    fs.writeFileSync(inputFilePath, inputText);

    shell.exec(`python3 ${pythonFilePath} < ${inputFilePath}`, (compileErr, stdout, stderr) => {
        let output = null;
        let compileErrors = null;
        let runtimeErrors = null;
        console.log({ compileErr, stdout, stderr });

        if (compileErr) {
            compileErrors = stderr;
            if (compileErrors) {
                // Send compile errors immediately and skip runtime execution
                res.json({ output, compile_errors: compileErrors, runtime_errors: runtimeErrors });
            }
        } else {
            res.json({ output: stdout, compile_errors: compileErrors, runtime_errors: runtimeErrors });

        }
        shell.exec(`rm ${pythonFilePath} ${inputFilePath}`);
    });
}

export const runNodejsCode = async ({ res, code, inputText, }) => {
    const fileId = uuidv4();
    const nodejsFilePath = path.join(TMP_DIR, `${fileId}.js`);
    const inputFilePath = path.join(TMP_DIR, `${fileId}.txt`);

    fs.writeFileSync(nodejsFilePath, code);
    fs.writeFileSync(inputFilePath, inputText);


    shell.exec(`node ${nodejsFilePath} < ${inputFilePath}`, (compileErr, stdout, stderr) => {
        let output = null;
        let compileErrors = null;
        let runtimeErrors = null;
        console.log({ compileErr, stdout, stderr });

        if (compileErr) {
            compileErrors = stderr;
            if (compileErrors) {
                // Send compile errors immediately and skip runtime execution
                res.json({ output, compile_errors: compileErrors, runtime_errors: runtimeErrors });
            }
        } else {
            res.json({ output: stdout, compile_errors: compileErrors, runtime_errors: runtimeErrors });

        }
        shell.exec(`rm ${nodejsFilePath} ${inputFilePath}`);
    });
}