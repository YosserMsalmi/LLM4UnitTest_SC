import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {Box, Paper, Typography, Button, CircularProgress, IconButton} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Sidebar from './Sidebar';
import TestSummary from './TestSummary';
import CoverageSummary from './CoverageSummary';
import TestCases from './TestCases';
import RawOutput from './RawOutput';
import { generatePDFReport } from './utils';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Metrics = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { testResults, testCode, contractCode, inputData } = location.state || {};
    const [activeSidebarItem, setActiveSidebarItem] = useState('metrics');
    const [editedTestCode, setEditedTestCode] = useState(location.state?.testCode || '');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const handleSidebarNavigation = (item) => {
        setActiveSidebarItem(item);
        if (item === 'home') navigate('/');
        else if (item === 'generationResults') navigate('/results', {
            state: {
                generatedTest: editedTestCode ? `\`\`\`javascript\n${editedTestCode}\n\`\`\`` : '',
                inputData: inputData || {
                    contractCode: contractCode || '',
                    promptType: 'type4'
                },
                ...(location.state || {})
            }
        });
        else if (item === 'settings') navigate('/settings');
    };

    if (!testResults) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', p: 2, gap: 2 }}>
                <Sidebar
                    activeItem={activeSidebarItem}
                    onNavigate={handleSidebarNavigation}
                />
                <Paper sx={{ flex: 1, bgcolor: '#EAEAEA', borderRadius: '10px', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h4">Test Metrics</Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>No test results available</Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', mb: 3 }}>Please run tests from the Results page</Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/results', {
                            state: {
                                generatedTest: editedTestCode ? `\`\`\`javascript\n${editedTestCode}\n\`\`\`` : '',
                                inputData: inputData || {
                                    contractCode: contractCode || '',
                                    promptType: 'type4'
                                },
                                ...(location.state || {})
                            }
                        })}
                        sx={{ alignSelf: 'center' }}
                    >
                        Back to Results
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', p: 2, gap: 2 }}>
            <Sidebar
                activeItem={activeSidebarItem}
                onNavigate={handleSidebarNavigation}
            />

            <Paper sx={{ flex: 1, bgcolor: '#EAEAEA', borderRadius: '10px', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate('/results', {
                            state: {
                                generatedTest: editedTestCode ? `\`\`\`javascript\n${editedTestCode}\n\`\`\`` : '',
                                inputData: inputData || {
                                    contractCode: contractCode || '',
                                    promptType: 'type4'
                                },
                                ...(location.state || {})
                            }
                        })} sx={{ mr: 1 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4">Test Metrics</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={isGeneratingPDF ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                        onClick={() => generatePDFReport(testResults, setIsGeneratingPDF)}
                        disabled={isGeneratingPDF}
                    >
                        {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
                    </Button>
                </Box>

                <TestSummary testResults={testResults} />
                <CoverageSummary testResults={testResults} />
                <TestCases testResults={testResults} />
                <RawOutput testResults={testResults} />
            </Paper>
        </Box>
    );
};

export default Metrics;