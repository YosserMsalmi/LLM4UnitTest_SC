import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Button,
    IconButton,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


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


    const generatePDFReport = () => {
        setIsGeneratingPDF(true);

        // Calculate summary from backend response
        const testSummary = {
            passed: testResults.summary?.TestsPassedCount || 0,
            failed: testResults.summary?.testsFailedCount || 0,
            total: testResults.summary?.totalTests ||
                (testResults.summary?.TestsPassedCount + testResults.summary?.testsFailedCount) || 0,
            coverage: {
                statements: testResults.coverage?.statements || 0,
                branches: testResults.coverage?.branches || 0,
                functions: testResults.coverage?.functions || 0,
                lines: testResults.coverage?.lines || 0
            },
            passedTests: testResults.summary?.testsPassed || [],
            failedTests: testResults.summary?.testsFailed || []
        };

        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text('Test Metrics Report', 105, 20, { align: 'center' });

        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

        // Add summary section
        doc.setFontSize(16);
        doc.text('Test Results Summary', 14, 40);

        // Add test results table using autoTable
        autoTable(doc, {
            startY: 45,
            head: [['Metric', 'Value']],
            body: [
                ['Total Tests', testSummary.total],
                ['Passed Tests', testSummary.passed],
                ['Failed Tests', testSummary.failed],
                ['Pass Rate', `${Math.round((testSummary.passed / testSummary.total) * 100)}%`]
            ],
            theme: 'grid',
            headStyles: { fillColor: '#1976d2' }
        });

        // Add coverage section
        doc.setFontSize(16);
        doc.text('Code Coverage', 14, doc.lastAutoTable.finalY + 15);

        // Add coverage table
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Type', 'Coverage %']],
            body: [
                ['Statements', `${testSummary.coverage.statements}%`],
                ['Branches', `${testSummary.coverage.branches}%`],
                ['Functions', `${testSummary.coverage.functions}%`],
                ['Lines', `${testSummary.coverage.lines}%`]
            ],
            theme: 'grid',
            headStyles: { fillColor: '#1976d2' }
        });

        // Add passed tests section
        doc.setFontSize(16);
        doc.text('Passed Tests', 14, doc.lastAutoTable.finalY + 15);

        if (testSummary.passedTests.length > 0) {
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 20,
                head: [['#', 'Test Name']],
                body: testSummary.passedTests.map((test, index) => [index + 1, test]),
                theme: 'grid',
                headStyles: { fillColor: '#4caf50' }
            });
        } else {
            doc.text('No tests passed', 14, doc.lastAutoTable.finalY + 20);
        }

        // Add failed tests section
        doc.setFontSize(16);
        doc.text('Failed Tests', 14, doc.lastAutoTable.finalY + 15);

        if (testSummary.failedTests.length > 0) {
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 20,
                head: [['#', 'Test Name']],
                body: testSummary.failedTests.map((test, index) => [index + 1, test]),
                theme: 'grid',
                headStyles: { fillColor: '#f44336' }
            });
        } else {
            doc.text('No tests failed', 14, doc.lastAutoTable.finalY + 20);
        }

        // Save the PDF
        doc.save(`test-metrics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
        setIsGeneratingPDF(false);
    };

    if (!testResults) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', p: 2, gap: 2 }}>
                {/* Sidebar */}
                <Paper sx={{ width: 250, bgcolor: '#EAEAEA', p: 2, borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
                    <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('home')}>Home</Button>
                    <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('generationResults')}>Test Execution</Button>
                    <Button fullWidth variant={activeSidebarItem === 'metrics' ? 'contained' : 'outlined'} sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('metrics')}>Test Metrics</Button>
                    <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('settings')}>Settings</Button>
                </Paper>

                {/* Main Content */}
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

    // Calculate summary from backend response
    const testSummary = {
        passed: testResults.summary?.TestsPassedCount || 0,
        failed: testResults.summary?.testsFailedCount || 0,
        total: testResults.summary?.totalTests ||
            (testResults.summary?.TestsPassedCount + testResults.summary?.testsFailedCount) || 0,
        coverage: {
            statements: testResults.coverage?.statements || 0,
            branches: testResults.coverage?.branches || 0,
            functions: testResults.coverage?.functions || 0,
            lines: testResults.coverage?.lines || 0
        },
        passedTests: testResults.summary?.testsPassed || [],
        failedTests: testResults.summary?.testsFailed || []
    };

    const renderCircularProgress = (value, color, size = 120, thickness = 4) => (
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

    const renderTestResultCircle = (passed, failed, total, size = 120) => {
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

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', p: 2, gap: 2 }}>
            {/* Sidebar */}
            <Paper sx={{ width: 250, bgcolor: '#EAEAEA', p: 2, borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
                <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('home')}>Home</Button>
                <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('generationResults')}>Test Execution</Button>
                <Button fullWidth variant={activeSidebarItem === 'metrics' ? 'contained' : 'outlined'} sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('metrics')}>Metrics</Button>
                <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('settings')}>Settings</Button>
            </Paper>

            {/* Main Content */}
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
                        onClick={generatePDFReport}
                        disabled={isGeneratingPDF}
                    >
                        {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
                    </Button>
                </Box>

                {/* Test Results Summary */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Test Results</Typography>
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} sm={6} md={4} sx={{ textAlign: 'center' }}>
                            {renderTestResultCircle(
                                testSummary.passed,
                                testSummary.failed,
                                testSummary.total
                            )}
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

                {/* Coverage Summary */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Code Coverage</Typography>
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" gutterBottom>Statements</Typography>
                            {renderCircularProgress(testSummary.coverage.statements, '#4caf50')}
                        </Grid>
                        <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" gutterBottom>Branches</Typography>
                            {renderCircularProgress(testSummary.coverage.branches, '#2196f3')}
                        </Grid>
                        <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" gutterBottom>Functions</Typography>
                            {renderCircularProgress(testSummary.coverage.functions, '#9c27b0')}
                        </Grid>
                        <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" gutterBottom>Lines</Typography>
                            {renderCircularProgress(testSummary.coverage.lines, '#ff9800')}
                        </Grid>
                    </Grid>
                </Paper>

                {/* Test Cases */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Test Cases</Typography>

                    {/* Passed Tests */}
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon color="success" />
                                <Typography>Passed Tests ({testSummary.passedTests.length})</Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List dense>
                                {testSummary.passedTests.map((test, index) => (
                                    <ListItem key={`passed-${index}`}>
                                        <ListItemIcon>
                                            <CheckCircleIcon color="success" />
                                        </ListItemIcon>
                                        <ListItemText primary={test} />
                                    </ListItem>
                                ))}
                                {testSummary.passedTests.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                                        No tests passed
                                    </Typography>
                                )}
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    {/* Failed Tests */}
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ErrorIcon color="error" />
                                <Typography>Failed Tests ({testSummary.failedTests.length})</Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List dense>
                                {testSummary.failedTests.map((test, index) => (
                                    <ListItem key={`failed-${index}`}>
                                        <ListItemIcon>
                                            <ErrorIcon color="error" />
                                        </ListItemIcon>
                                        <ListItemText primary={test} />
                                    </ListItem>
                                ))}
                                {testSummary.failedTests.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                                        No tests failed
                                    </Typography>
                                )}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Paper>

                {/* Raw Output */}
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
            </Paper>
        </Box>
    );
};

export default Metrics;