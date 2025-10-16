import React from 'react';
import { Paper, Typography } from '@mui/material';

const RawOutput = ({ testResults }) => {
    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Raw Test Output</Typography>
            <Paper
                component="pre"
                sx={{
                    p: 2,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    maxHeight: '300px'
                }}
            >
                {testResults.rawOutput || 'No raw output available'}
            </Paper>
        </Paper>
    );
};

export default RawOutput;