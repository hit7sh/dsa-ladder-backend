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

const compareOutputs = (str1, str2) => {
    const cleanStr1 = str1.replace(/\s+/g, '');
    const cleanStr2 = str2.replace(/\s+/g, '');
    return cleanStr1 === cleanStr2;
};

export const submitCode = async ({ res, code, language, testCases, }) => {
    const codeRunner = getCodeRunner({ language });
    const response = [];
    await Promise.all(testCases?.map(async ({ input, output: expectedOutput, }) => {
        const { output, compile_errors, runtime_errors } = await codeRunner({ res, code, inputText: input, })

        if (runtime_errors || compile_errors) {
            response.push({
                verdict: 'ER',
            });
            return;
        }
        if (!compareOutputs(expectedOutput, output)) {
            response.push({
                verdict: 'WA'
            });
            return;
        }
        response.push({
            verdict: 'AC',
        });
    }));
    res.json({ response });
};
