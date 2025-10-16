import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export const CircularProgressWithLabel = ({ value, color, size = 120, thickness = 4 }) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
            variant="determinate"
            value={100}
            thickness={thickness}
            size={size}
            sx={{ color: '#e0e0e0' }}
        />
        <CircularProgress
            variant="determinate"
            value={value}
            thickness={thickness}
            size={size}
            sx={{ color, position: 'absolute', left: 0 }}
        />
        <Box
            sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Typography variant="h5" component="div">
                {Math.round(value)}%
            </Typography>
        </Box>
    </Box>
);

export const TestResultCircle = ({ passed, failed, total, size = 120 }) => {
    const passPercentage = (passed / total) * 100;
    const failPercentage = (failed / total) * 100;

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
                variant="determinate"
                value={100}
                thickness={4}
                size={size}
                sx={{ color: '#e0e0e0' }}
            />
            <CircularProgress
                variant="determinate"
                value={passPercentage}
                thickness={4}
                size={size}
                sx={{ color: '#4caf50', position: 'absolute', left: 0 }}
            />
            <CircularProgress
                variant="determinate"
                value={failPercentage}
                thickness={4}
                size={size}
                sx={{
                    color: '#f44336',
                    position: 'absolute',
                    left: 0,
                    transform: 'rotate(-90deg) scaleX(-1)'
                }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="h5" component="div">
                    {passed}/{total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Tests
                </Typography>
            </Box>
        </Box>
    );
};