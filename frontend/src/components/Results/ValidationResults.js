import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';

const ValidationResults = ({ validationResult, isValidated }) => {
    return (
        <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Validation Results
                {validationResult.message && (
                    <Chip
                        label={isValidated ? "Valid" : "Invalid"}
                        color={isValidated ? "success" : "error"}
                        size="small"
                        sx={{ ml: 2 }}
                    />
                )}
            </Typography>
            {validationResult.message ? (
                <Box sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: validationResult.hasErrors ? '#ffebee' : '#e8f5e9',
                    color: validationResult.hasErrors ? '#c62828' : '#2e7d32',
                    maxHeight: '300px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem'
                }}>
                    {validationResult.message}
                </Box>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No validation performed yet
                </Typography>
            )}
        </Paper>
    );
};

export default ValidationResults;