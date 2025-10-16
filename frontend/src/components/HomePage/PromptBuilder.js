import React from 'react';
import {
    Paper, Typography, Box,
    TextareaAutosize, Button, CircularProgress
} from '@mui/material';

const PromptBuilder = ({
                           tiles,
                           onTileChange,
                           solidityFile,
                           isGenerating,
                           onGenerate
                       }) => {
    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>🔹Test Specifications</Typography>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Context:</Typography>
                <TextareaAutosize
                    minRows={2}
                    style={{ width: '100%', padding: '8px' }}
                    value={tiles.context}
                    onChange={(e) => onTileChange('context', e.target.value)}
                    placeholder="Generate JavaScript unit tests for this smart contract"
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Contract Code:</Typography>
                <TextareaAutosize
                    minRows={6}
                    style={{ width: '100%', padding: '8px' }}
                    value={solidityFile}
                    readOnly
                    placeholder="Solidity code will appear here after file upload..."
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Testing Instructions:</Typography>
                <TextareaAutosize
                    minRows={4}
                    style={{ width: '100%', padding: '8px' }}
                    value={tiles.generalInstructions}
                    onChange={(e) => onTileChange('generalInstructions', e.target.value)}
                    placeholder="Example: Use Hardhat and Chai for testing, cover all edge cases"
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Test Requirements:</Typography>
                <TextareaAutosize
                    minRows={4}
                    style={{ width: '100%', padding: '8px' }}
                    value={tiles.requirements}
                    onChange={(e) => onTileChange('requirements', e.target.value)}
                    placeholder={`Test Cases to Cover:
1. [Positive Case] Verify successful function execution
2. [Negative Case] Test expected reverts
3. [Edge Case] Verify boundary conditions
4. [Security] Test access control restrictions
5. [Events] Verify event emissions`}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Example Test (Optional):</Typography>
                <TextareaAutosize
                    minRows={4}
                    style={{ width: '100%', padding: '8px' }}
                    value={tiles.exampleTest}
                    onChange={(e) => onTileChange('exampleTest', e.target.value)}
                    placeholder={`Example test structure:
describe("Contract Functionality", () => {
  it("should work correctly", async () => {
    // Test code here
  });
});`}
                />
            </Box>

            <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{ py: 2 }}
                onClick={onGenerate}
                disabled={
                    isGenerating ||
                    !solidityFile ||
                    !tiles.context ||
                    !tiles.generalInstructions ||
                    !tiles.requirements
                }
            >
                {isGenerating ? (
                    <>
                        <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                        Generating...
                    </>
                ) : (
                    'Generate Test'
                )}
            </Button>
        </Paper>
    );
};

export default PromptBuilder;