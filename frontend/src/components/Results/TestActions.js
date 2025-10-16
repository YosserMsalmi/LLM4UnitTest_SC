import React from 'react';
import { Paper, Typography, Grid, Tooltip, Button, CircularProgress } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const TestActions = ({
                         generatedTest,
                         editedTest,
                         isEditing,
                         isValidated,
                         isRunningTests,
                         onViewTest,
                         onDownload,
                         onValidate,
                         onRunTests
                     }) => {
    return (
        <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Test Actions</Typography>
            <Grid container spacing={2}>
                <Grid item>
                    <Tooltip title="Preview test code">
                        <Button
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            onClick={onViewTest}
                            disabled={!generatedTest}
                        >
                            View Test
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Download test file">
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={onDownload}
                            disabled={!generatedTest && !editedTest}
                        >
                            Download
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Validate test file for syntax errors">
                        <Button
                            variant="contained"
                            color="success"
                            onClick={onValidate}
                            disabled={!generatedTest}
                            sx={{ minWidth: 150 }}
                        >
                            Validate test file
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Run tests with coverage">
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={isRunningTests ? <CircularProgress size={20} color="inherit" /> : <PlayCircleOutlineIcon />}
                            onClick={onRunTests}
                            disabled={!isValidated || isRunningTests || !generatedTest}
                            sx={{ minWidth: 150 }}
                        >
                            {isRunningTests ? 'Running...' : 'Run Tests'}
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TestActions;