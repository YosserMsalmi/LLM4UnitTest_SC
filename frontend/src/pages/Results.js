import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Snackbar,
  IconButton,
  Modal,
  CircularProgress,
  Grid,
  Tooltip,
  TextField,
  Chip
} from '@mui/material';
import Alert from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import axios from 'axios';
import { extractJavaScriptCode } from './testUtils';

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

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(isEditing ? editedTest : extractJavaScriptCode(testInfo.generatedTest))
        .then(() => showNotification('Test copied to clipboard!', 'success'))
        .catch(() => showNotification('Failed to copy text', 'error'));
  };

  const handleDownload = () => {
    try {
      const displayedCode = isEditing ? editedTest : extractJavaScriptCode(testInfo.generatedTest);
      if (!displayedCode) {
        showNotification('No test code available to download', 'warning');
        return;
      }

      const blob = new Blob([displayedCode], { type: 'text/javascript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'TestContract.js';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      showNotification('Test file downloaded successfully!', 'success');
    } catch (error) {
      showNotification(`Download failed: ${error.message}`, 'error');
    }
  };

  const handleValidateTest = async () => {
    try {
      const jsCode = isEditing ? editedTest : extractJavaScriptCode(testInfo.generatedTest);

      if (!jsCode.trim()) {
        setValidationResult({
          hasErrors: true,
          message: 'Error: Test file is empty'
        });
        setIsValidated(false);
        return;
      }

      const response = await axios.post(
          'http://localhost:8080/api/tests/validate',
          jsCode,
          {
            params: { fileName: 'TestContract.js' },
            headers: { 'Content-Type': 'text/plain' }
          }
      );

      // Format the validation results for display
      let validationMessage = '';
      if (response.data.valid) {
        validationMessage = `✅ Validation successful!\n` +
            `Validation Score: ${response.data.syntaxValidationMetric}%\n` +
            `Lines of Code: ${response.data.totalLinesOfCode}\n` +
            `Errors Found: ${response.data.totalErrors}`;
      } else {
        validationMessage = `❌ Validation failed!\n` +
            `Validation Score: ${response.data.syntaxValidationMetric}%\n` +
            `Lines of Code: ${response.data.totalLinesOfCode}\n` +
            `Errors Found: ${response.data.totalErrors}\n\n`;

        if (response.data.errors && response.data.errors.length > 0) {
          validationMessage += `=== Detailed Errors ===\n` +
              response.data.errors.map(err =>
                  `Error ${err.index}: ${err.message}\n` +
                  `Location: Line ${err.loc?.line || 'N/A'}, Column ${err.loc?.column || 'N/A'}\n`
              ).join('\n');
        } else if (response.data.error) {
          validationMessage += `Error: ${response.data.error}\n`;
          if (response.data.message) {
            validationMessage += `Details: ${response.data.message}\n`;
          }
        }
      }

      setValidationResult({
        hasErrors: !response.data.valid,
        message: validationMessage
      });
      setIsValidated(response.data.valid);

      showNotification(
          response.data.valid ? 'Test validated successfully!' : 'Test contains errors',
          response.data.valid ? 'success' : 'error'
      );

    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        hasErrors: true,
        message: `Validation failed: ${error.response?.data?.error || error.message}`
      });
      setIsValidated(false);
      showNotification('Validation service error', 'error');
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    showNotification('Running tests with coverage... Please wait.', 'info');

    try {
      const jsCode = isEditing ? editedTest : extractJavaScriptCode(testInfo.generatedTest);

      const response = await axios.post('http://localhost:8080/api/run', {
        testCode: jsCode,
        solidityCode: testInfo.inputData?.contractCode || '',
      });

      const transformedResults = {
        status: response.data.status,
        rawOutput: response.data.rawOutput,
        summary: {
          contract: response.data.summary?.contract || 'MyContract.sol',
          test: response.data.summary?.test || 'MyTest.js',
          TestsPassedCount: response.data.summary?.TestsPassedCount || 0,
          testsFailedCount: response.data.summary?.testsFailedCount || 0,
          testsPassed: response.data.summary?.testsPassed || [],
          testsFailed: response.data.summary?.testsFailed || [],
          totalTests: (response.data.summary?.TestsPassedCount || 0) +
              (response.data.summary?.testsFailedCount || 0)
        },
        coverage: {
          statements: parseFloat(response.data.coverage?.statements) || 0,
          branches: parseFloat(response.data.coverage?.branches) || 0,
          functions: parseFloat(response.data.coverage?.functions) || 0,
          lines: parseFloat(response.data.coverage?.lines) || 0
        }
      };

      navigate('/metrics', {
        state: {
          testResults: transformedResults,
          contractCode: testInfo.inputData?.contractCode,
          testCode: jsCode,
          inputData: testInfo.inputData
        }
      });

    } catch (error) {
      console.error('Test execution error:', error);
      let errorMessage = 'Test execution failed';

      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, 'error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', p: 2, gap: 2 }}>
        {/* Sidebar */}
        <Paper sx={{ width: 250, bgcolor: '#EAEAEA', p: 2, borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
          <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() => handleSidebarNavigation('home')}
          >
            Home
          </Button>
          <Button
              fullWidth
              variant={activeSidebarItem === 'results' ? 'contained' : 'outlined'}
              sx={{ mb: 2 }}
              onClick={() => handleSidebarNavigation('results')}
          >
            Test Execution
          </Button>
          <Button
              fullWidth
              variant={activeSidebarItem === 'metrics' ? 'contained' : 'outlined'}
              sx={{ mb: 2 }}
              onClick={() => handleSidebarNavigation('metrics')}
          >
            Test Metrics
          </Button>
          <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('settings')}>
            Settings
          </Button>
        </Paper>

        {/* Main Content */}
        <Paper sx={{ flex: 1, bgcolor: '#EAEAEA', borderRadius: '10px', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate("/")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">Test Execution</Typography>
          </Box>

          {/* Test Info */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1"><strong>Model:</strong> {testInfo.model}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Test Actions */}
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Test Actions</Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Tooltip title="Preview test code">
                  <Button
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setModalOpen(true)}
                      disabled={!testInfo.generatedTest}
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
                      onClick={handleDownload}
                      disabled={!testInfo.generatedTest && !editedTest}
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
                      onClick={handleValidateTest}
                      disabled={!testInfo.generatedTest}
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
                      onClick={handleRunTests}
                      disabled={!isValidated || isRunningTests || !testInfo.generatedTest}
                      sx={{ minWidth: 150 }}
                  >
                    {isRunningTests ? 'Running...' : 'Run Tests'}
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>

          {/* Validation Results */}
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

          <Snackbar
              open={notification.open}
              autoHideDuration={6000}
              onClose={handleCloseNotification}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
              {notification.message}
            </Alert>
          </Snackbar>
        </Paper>
      </Box>
  );
};

export default Results;