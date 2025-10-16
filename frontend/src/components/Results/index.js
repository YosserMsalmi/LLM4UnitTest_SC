import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {Box, Button, IconButton, Modal, Paper, TextField, Tooltip, Typography} from '@mui/material';
import Sidebar from './Sidebar';
import TestInfo from './TestInfo';
import TestActions from './TestActions';
import ValidationResults from './ValidationResults';
import Notification from './Notification';
import {
    extractJavaScriptCode,
    handleCopyToClipboard,
    handleDownload,
    handleRunTests,
    handleValidateTest
} from './utils';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeSidebarItem, setActiveSidebarItem] = useState('results');
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [testInfo, setTestInfo] = useState({
        model: 'DeepSeek-R1:14B',
        generatedTest: '',
        inputData: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedTest, setEditedTest] = useState('');
    const [validationResult, setValidationResult] = useState({
        hasErrors: false,
        message: ''
    });
    const [isValidated, setIsValidated] = useState(false);

    const handleSidebarNavigation = (item) => {
        setActiveSidebarItem(item);
        if (item === 'home') navigate('/');
        else if (item === 'results') navigate('/results');
        else if (item === 'metrics') navigate('/metrics');
        else if (item === 'settings') navigate('/settings');
    };

    useEffect(() => {
        if (location.state?.generatedTest) {
            const code = extractJavaScriptCode(location.state.generatedTest);
            setTestInfo(prev => ({
                ...prev,
                generatedTest: location.state.generatedTest,
                inputData: {
                    ...location.state.inputData,
                    contractCode: location.state.inputData?.contractCode || ''
                },
            }));
            setEditedTest(code);
        }
    }, [location.state]);

    const showNotification = (message, severity) => {
        setNotification({ open: true, message, severity });
    };
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(isEditing ? editedTest : extractJavaScriptCode(testInfo.generatedTest))
            .then(() => showNotification('Test copied to clipboard!', 'success'))
            .catch(() => showNotification('Failed to copy text', 'error'));
    };


    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', p: 2, gap: 2 }}>
            <Sidebar
                activeItem={activeSidebarItem}
                onNavigate={handleSidebarNavigation}
            />

            <Paper sx={{ flex: 1, bgcolor: '#EAEAEA', borderRadius: '10px', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => navigate("/")}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4">Test Execution</Typography>
                </Box>



                <TestActions
                    generatedTest={testInfo.generatedTest}
                    editedTest={editedTest}
                    isEditing={isEditing}
                    isValidated={isValidated}
                    isRunningTests={isRunningTests}
                    onViewTest={() => setModalOpen(true)}
                    onDownload={() => handleDownload(editedTest, testInfo.generatedTest, showNotification)}
                    onValidate={() => handleValidateTest(
                        isEditing ? editedTest : extractJavaScriptCode(testInfo.generatedTest),
                        setValidationResult,
                        setIsValidated,
                        showNotification
                    )}
                    onRunTests={() => handleRunTests(
                        isEditing ? editedTest : extractJavaScriptCode(testInfo.generatedTest),
                        testInfo.inputData?.contractCode || '',
                        setIsRunningTests,
                        showNotification,
                        navigate,
                        testInfo.inputData
                    )}
                />

                <ValidationResults
                    validationResult={validationResult}
                    isValidated={isValidated}
                />

                {/* Test Preview Modal */}
                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                    <Paper sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxHeight: '80vh',
                        p: 3,
                        overflow: 'auto',
                        outline: 'none'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Test Code Preview</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title={isEditing ? "Save changes" : "Edit test"}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                            if (isEditing) {
                                                setTestInfo(prev => ({
                                                    ...prev,
                                                    generatedTest: `\`\`\`javascript\n${editedTest}\n\`\`\``
                                                }));
                                            }
                                            setIsEditing(!isEditing);
                                        }}
                                    >
                                        {isEditing ? 'Save' : 'Edit'}
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Copy to clipboard">
                                    <Button size="small" variant="outlined" onClick={handleCopyToClipboard}>
                                        <ContentCopyIcon fontSize="small" />
                                    </Button>
                                </Tooltip>
                            </Box>
                        </Box>

                        {isEditing ? (
                            <TextField
                                fullWidth
                                multiline
                                minRows={15}
                                maxRows={20}
                                value={editedTest}
                                onChange={(e) => setEditedTest(e.target.value)}
                                variant="outlined"
                                sx={{
                                    fontFamily: 'monospace',
                                    '& .MuiInputBase-root': {
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem'
                                    }
                                }}
                            />
                        ) : (
                            <Paper
                                component="pre"
                                sx={{
                                    p: 2,
                                    bgcolor: '#f8f8f8',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace',
                                    maxHeight: '60vh'
                                }}
                            >
                                {extractJavaScriptCode(testInfo.generatedTest) || 'No test generated yet...'}
                            </Paper>
                        )}
                    </Paper>
                </Modal>

                <Notification
                    open={notification.open}
                    message={notification.message}
                    severity={notification.severity}
                    onClose={handleCloseNotification}
                />
            </Paper>
        </Box>
    );
};

export default Results;