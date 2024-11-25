import { runCppCode, runJavaCode, runNodejsCode, runPythonCode } from './codeRunners.js';

const getCodeRunner = ({ language }) => {
    if (language === 'c_cpp') {
        return runCppCode;
    } else if (language === 'python') {
        return runPythonCode;
    } else if (language === 'javascript') {
        return runNodejsCode;
    } else if (language === 'java') {
        return runJavaCode;
    }
}

export const runCode = async ({ res, code, inputText, language, }) => {
    const codeRunner = getCodeRunner({ language });
    return res.json(await codeRunner({ res, code, inputText }));
};

export const submitCode = async ({ res, code, language, testCases, }) => {
    const codeRunner = getCodeRunner({ language });
    return res.json({ testCases });
};
