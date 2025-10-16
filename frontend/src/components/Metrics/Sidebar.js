import React from 'react';
import { Button, Paper } from '@mui/material';

const Sidebar = ({ activeItem, onNavigate }) => {
    return (
        <Paper sx={{ width: 250, bgcolor: '#EAEAEA', p: 2, borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
            <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                onClick={() => onNavigate('home')}
            >
                Home
            </Button>
            <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                onClick={() => onNavigate('generationResults')}
            >
                Test Execution
            </Button>
            <Button
                fullWidth
                variant={activeItem === 'metrics' ? 'contained' : 'outlined'}
                sx={{ mb: 2 }}
                onClick={() => onNavigate('metrics')}
            >
                Metrics
            </Button>
            <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                onClick={() => onNavigate('settings')}
            >
                Environment Details
            </Button>
        </Paper>
    );
};

export default Sidebar;