import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';

const TestInfo = ({ model }) => {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1"><strong>Model:</strong> {model}</Typography>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TestInfo;