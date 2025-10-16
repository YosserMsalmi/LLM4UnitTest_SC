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


