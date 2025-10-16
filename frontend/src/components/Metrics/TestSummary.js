import React from 'react';
import {Paper, Typography, Grid, Chip, Box} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { TestResultCircle } from './ProgressCharts';

const TestSummary = ({ testResults }) => {
    const testSummary = {
        passed: testResults.summary?.TestsPassedCount || 0,
        failed: testResults.summary?.testsFailedCount || 0,
        total: testResults.summary?.totalTests ||
            (testResults.summary?.TestsPassedCount + testResults.summary?.testsFailedCount) || 0
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Test Results</Typography>
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={4} sx={{ textAlign: 'center' }}>
                    <TestResultCircle
                        passed={testSummary.passed}
                        failed={testSummary.failed}
                        total={testSummary.total}
                    />
                    <Box sx={{ mt: 2 }}>
                        <Chip
                            icon={<CheckCircleIcon />}
                            label={`${testSummary.passed} Passed`}
                            color="success"
                            sx={{ mr: 1 }}
                        />
                        <Chip
                            icon={<ErrorIcon />}
                            label={`${testSummary.failed} Failed`}
                            color="error"
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TestSummary;