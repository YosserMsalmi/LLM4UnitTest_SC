import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';
import { CircularProgressWithLabel } from './ProgressCharts';

const CoverageSummary = ({ testResults }) => {
    const coverage = {
        statements: testResults.coverage?.statements || 0,
        branches: testResults.coverage?.branches || 0,
        functions: testResults.coverage?.functions || 0,
        lines: testResults.coverage?.lines || 0
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Code Coverage</Typography>
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>Statements</Typography>
                    <CircularProgressWithLabel value={coverage.statements} color="#4caf50" />
                </Grid>
                <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>Branches</Typography>
                    <CircularProgressWithLabel value={coverage.branches} color="#2196f3" />
                </Grid>
                <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>Functions</Typography>
                    <CircularProgressWithLabel value={coverage.functions} color="#9c27b0" />
                </Grid>
                <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>Lines</Typography>
                    <CircularProgressWithLabel value={coverage.lines} color="#ff9800" />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default CoverageSummary;