import React, { useState } from 'react';
import {
  Box, Button, Typography,
  TextareaAutosize, Paper, Snackbar, CircularProgress
} from '@mui/material';
import Alert from '@mui/material/Alert';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  // State for active sidebar item
  const [activeSidebarItem, setActiveSidebarItem] = useState('home');

  // State for file upload
  const [solidityFile, setSolidityFile] = useState('');

  // State for prompt builder tiles
  const [tiles, setTiles] = useState({
    context: '',
    generalInstructions: '',
    requirements: '',
    exampleTest: ''
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSolidityFile(e.target?.result);
    };
    reader.readAsText(file);
  };

  const handleTileChange = (field, value) => {
    setTiles(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateTest = async () => {
    setIsGenerating(true);
    try {
      const requestData = {
        context: tiles.context,
        generalInstructions: tiles.generalInstructions,
        requirements: tiles.requirements,
        exampleTest: tiles.exampleTest,
        solidityCode: solidityFile
      };

      const response = await axios.post('http://localhost:8080/api/llm/generate-test', requestData);

      navigate('/results', {
        state: {
          generatedTest: response.data,
          inputData: {
            contractCode: solidityFile,
          }
        }
      });

      setNotification({
        open: true,
        message: 'Test generated successfully!',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error generating test:', error);
      setNotification({
        open: true,
        message: error.response?.data || 'Failed to generate test',
        severity: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSidebarNavigation = (item) => {
    setActiveSidebarItem(item);
    if (item === 'home') navigate('/');
    else if (item === 'results') navigate('/results');
    else if (item === 'metrics') navigate('/metrics');
    else if (item === 'settings') navigate('/settings');
  };

  return (
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 2,
        gap: 2
      }}>
        {/* Notification Snackbar */}
        <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Sidebar */}
        <Paper sx={{ width: 250, bgcolor: '#EAEAEA', p: 2, borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
          <Button fullWidth variant={activeSidebarItem === 'home' ? 'contained' : 'outlined'} sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('home')}>Home</Button>
          <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('results')}>Test Execution</Button>
          <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('metrics')}>Test Metrics</Button>
          <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('settings')}>Settings</Button>
        </Paper>

        {/* Main Content */}
        <Paper sx={{
          flex: 1,
          bgcolor: '#EAEAEA',
          borderRadius: '10px',
          p: 3,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeSidebarItem === 'home' ? (
              <>
                <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Smart Contract Test Generator</Typography>

                {/* File Upload Section */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>🔹Upload Solidity Contract</Typography>
                  <Box>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<FileUploadIcon />}
                    >
                      Upload .sol File
                      <input
                          type="file"
                          hidden
                          accept=".sol"
                          onChange={handleFileUpload}
                      />
                    </Button>
                    {solidityFile && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Solidity file uploaded successfully!
                        </Typography>
                    )}
                  </Box>
                </Paper>

                {/* Prompt Builder Section */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>🔹Test Specifications</Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Context:</Typography>
                    <TextareaAutosize
                        minRows={2}
                        style={{ width: '100%', padding: '8px' }}
                        value={tiles.context}
                        onChange={(e) => handleTileChange('context', e.target.value)}
                        placeholder="Generate JavaScript unit tests for this smart contract"
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Contract Code:</Typography>
                    <TextareaAutosize
                        minRows={6}
                        style={{ width: '100%', padding: '8px' }}
                        value={solidityFile}
                        readOnly
                        placeholder="Solidity code will appear here after file upload..."
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Testing Instructions:</Typography>
                    <TextareaAutosize
                        minRows={4}
                        style={{ width: '100%', padding: '8px' }}
                        value={tiles.generalInstructions}
                        onChange={(e) => handleTileChange('generalInstructions', e.target.value)}
                        placeholder="Example: Use Hardhat and Chai for testing, cover all edge cases"
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Test Requirements:</Typography>
                    <TextareaAutosize
                        minRows={4}
                        style={{ width: '100%', padding: '8px' }}
                        value={tiles.requirements}
                        onChange={(e) => handleTileChange('requirements', e.target.value)}
                        placeholder={`Test Cases to Cover:
1. [Positive Case] Verify successful function execution
2. [Negative Case] Test expected reverts
3. [Edge Case] Verify boundary conditions
4. [Security] Test access control restrictions
5. [Events] Verify event emissions`}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Example Test (Optional):</Typography>
                    <TextareaAutosize
                        minRows={4}
                        style={{ width: '100%', padding: '8px' }}
                        value={tiles.exampleTest}
                        onChange={(e) => handleTileChange('exampleTest', e.target.value)}
                        placeholder={`Example test structure:
describe("Contract Functionality", () => {
  it("should work correctly", async () => {
    // Test code here
  });
});`}
                    />
                  </Box>
                </Paper>

                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ py: 2 }}
                    onClick={handleGenerateTest}
                    disabled={
                        isGenerating ||
                        !solidityFile ||
                        !tiles.context ||
                        !tiles.generalInstructions ||
                        !tiles.requirements
                    }
                >
                  {isGenerating ? (
                      <>
                        <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                        Generating...
                      </>
                  ) : (
                      'Generate Test'
                  )}
                </Button>
              </>
          ) : null}
        </Paper>
      </Box>
  );
};

export default HomePage;