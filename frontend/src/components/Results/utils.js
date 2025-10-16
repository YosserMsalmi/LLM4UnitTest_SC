import axios from 'axios';
export const extractJavaScriptCode = (text) => {
    const textString = typeof text === 'string' ? text : text?.generatedTest || '';
    const sanitizedText = textString
        .replace(/<<<<<<< SEARCH/g, '')
        .replace(/=======/g, '')
        .replace(/>>>>>>> REPLACE/g, '')
        .replace(/<think>/g, '')
        .replace(/<\/think>/g, '')
        .trim();

    const regex = /```javascript\s*([\s\S]*?)\s*```/;
    const match = sanitizedText.match(regex);
    return match ? match[1].trim() : '';
};

export const parseTestResults = (output) => {
    // Ensure output is a string
    const outputStr = typeof output === 'string' ? output : JSON.stringify(output, null, 2);

    // Initialize default result
    const result = {
        passedTests: [],
        failedTests: [],
        coverage: {},
        failedTestDetails: []
    };

    try {
        // Parse passed tests
        const passedMatches = outputStr.matchAll(/√ (.+)/g);
        for (const match of passedMatches) {
            result.passedTests.push(match[1]);
        }

        // Parse failed tests
        const failedMatches = outputStr.matchAll(/\d+\) (.+?):\n\s+(.+?)(?=\n\s+\d+\)|\n\n)/gs);
        for (const match of failedMatches) {
            const testName = match[1];
            const error = match[2].trim();
            result.failedTests.push(testName);
            result.failedTestDetails.push({ name: testName, error });
        }

        // Parse coverage if available in the output
        const coverageMatch = outputStr.match(/File\s+\|.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n/);
        if (coverageMatch) {
            const coverageLines = coverageMatch[0].split('\n');
            if (coverageLines.length >= 3) {
                const coverageValues = coverageLines[2].split('|').map(v => v.trim());
                if (coverageValues.length >= 6) {
                    result.coverage = {
                        statements: coverageValues[1],
                        branches: coverageValues[2],
                        functions: coverageValues[3],
                        lines: coverageValues[4] || coverageValues[3] // Fallback to functions if lines not available
                    };
                }
            }
        }

    } catch (error) {
        console.error('Error parsing test results:', error);
        result.rawOutput = outputStr;
        result.parseError = error.message;
    }

    return result;
};



export const handleCopyToClipboard = async (text, showNotification) => {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Test copied to clipboard!', 'success');
    } catch {
        showNotification('Failed to copy text', 'error');
    }
};

export const handleDownload = (editedTest, generatedTest, showNotification) => {
    try {
        const displayedCode = editedTest || generatedTest;
        if (!displayedCode) {
            showNotification('No test code available to download', 'warning');
            return;
        }

        const blob = new Blob([displayedCode], { type: 'text/javascript;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TestContract.js';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        showNotification('Test file downloaded successfully!', 'success');
    } catch (error) {
        showNotification(`Download failed: ${error.message}`, 'error');
    }
};

export const handleValidateTest = async (jsCode, setValidationResult, setIsValidated, showNotification) => {
    try {
        if (!jsCode.trim()) {
            setValidationResult({
                hasErrors: true,
                message: 'Error: Test file is empty'
            });
            setIsValidated(false);
            return;
        }

        const response = await axios.post(
            'http://localhost:8080/api/tests/validate',
            jsCode,
            {
                params: { fileName: 'TestContract.js' },
                headers: { 'Content-Type': 'text/plain' }
            }
        );

        let validationMessage = '';
        if (response.data.valid) {
            validationMessage = `✅ Validation successful!\n` +
                `Validation Score: ${response.data.syntaxValidationMetric}%\n` +
                `Lines of Code: ${response.data.totalLinesOfCode}\n` +
                `Errors Found: ${response.data.totalErrors}`;
        } else {
            validationMessage = `❌ Validation failed!\n` +
                `Validation Score: ${response.data.syntaxValidationMetric}%\n` +
                `Lines of Code: ${response.data.totalLinesOfCode}\n` +
                `Errors Found: ${response.data.totalErrors}\n\n`;

            if (response.data.errors && response.data.errors.length > 0) {
                validationMessage += `=== Detailed Errors ===\n` +
                    response.data.errors.map(err =>
                        `Error ${err.index}: ${err.message}\n` +
                        `Location: Line ${err.loc?.line || 'N/A'}, Column ${err.loc?.column || 'N/A'}\n`
                    ).join('\n');
            } else if (response.data.error) {
                validationMessage += `Error: ${response.data.error}\n`;
                if (response.data.message) {
                    validationMessage += `Details: ${response.data.message}\n`;
                }
            }
        }

        setValidationResult({
            hasErrors: !response.data.valid,
            message: validationMessage
        });
        setIsValidated(response.data.valid);

        showNotification(
            response.data.valid ? 'Test validated successfully!' : 'Test contains errors',
            response.data.valid ? 'success' : 'error'
        );
    } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({
            hasErrors: true,
            message: `Validation failed: ${error.response?.data?.error || error.message}`
        });
        setIsValidated(false);
        showNotification('Validation service error', 'error');
    }
};

export const handleRunTests = async (jsCode, contractCode, setIsRunningTests, showNotification, navigate, inputData) => {
    setIsRunningTests(true);
    showNotification('Running tests with coverage... Please wait.', 'info');

    try {
        const response = await axios.post('http://localhost:8080/api/run', {
            testCode: jsCode,
            solidityCode: contractCode || '',
        });

        const transformedResults = {
            status: response.data.status,
            rawOutput: response.data.rawOutput,
            summary: {
                contract: response.data.summary?.contract || 'MyContract.sol',
                test: response.data.summary?.test || 'MyTest.js',
                TestsPassedCount: response.data.summary?.TestsPassedCount || 0,
                testsFailedCount: response.data.summary?.testsFailedCount || 0,
                testsPassed: response.data.summary?.testsPassed || [],
                testsFailed: response.data.summary?.testsFailed || [],
                totalTests: (response.data.summary?.TestsPassedCount || 0) +
                    (response.data.summary?.testsFailedCount || 0)
            },
            coverage: {
                statements: parseFloat(response.data.coverage?.statements) || 0,
                branches: parseFloat(response.data.coverage?.branches) || 0,
                functions: parseFloat(response.data.coverage?.functions) || 0,
                lines: parseFloat(response.data.coverage?.lines) || 0
            }
        };

        navigate('/metrics', {
            state: {
                testResults: transformedResults,
                contractCode: contractCode,
                testCode: jsCode,
                inputData: inputData
            }
        });
    } catch (error) {
        console.error('Test execution error:', error);
        let errorMessage = 'Test execution failed';

        if (error.response) {
            if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data?.error) {
                errorMessage = error.response.data.error;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        showNotification(errorMessage, 'error');
    } finally {
        setIsRunningTests(false);
    }
};