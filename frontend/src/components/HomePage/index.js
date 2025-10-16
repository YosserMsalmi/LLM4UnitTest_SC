import React, { useState } from 'react';
import {Box, Paper, Typography} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import FileUploadSection from './FileUploadSection';
import PromptBuilder from './PromptBuilder';
import Notification from './Notification';
import axios from "axios";

const HomePage = () => {
    const [activeSidebarItem, setActiveSidebarItem] = useState('home');
    const [solidityFile, setSolidityFile] = useState('');
    const [tiles, setTiles] = useState({
        context: '',
        generalInstructions: '',
        requirements: '',
        exampleTest: ''
    });
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();

    const handleSidebarNavigation = (item) => {
        setActiveSidebarItem(item);
        if (item === 'home') navigate('/');
        else if (item === 'results') navigate('/results');
        else if (item === 'metrics') navigate('/metrics');
        else if (item === 'settings') navigate('/settings');
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

            const response = await axios.post('http://localhost:8080/api/prompt/generate-test', requestData);

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

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            p: 2,
            gap: 2
        }}>
            <Sidebar
                activeItem={activeSidebarItem}
                onNavigate={handleSidebarNavigation}
            />

            <Paper sx={{
                flex: 1,
                bgcolor: '#EAEAEA',
                borderRadius: '10px',
                p: 3,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {activeSidebarItem === 'home' && (
                    <>
                        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                            LLM4UnitTests-SC
                        </Typography>

                        <FileUploadSection
                            solidityFile={solidityFile}
                            onFileUpload={setSolidityFile}
                        />

                        <PromptBuilder
                            tiles={tiles}
                            onTileChange={(field, value) => setTiles(prev => ({ ...prev, [field]: value }))}
                            solidityFile={solidityFile}
                            isGenerating={isGenerating}
                            onGenerate={handleGenerateTest}
                        />
                    </>
                )}
            </Paper>

            <Notification
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={handleCloseNotification}
            />
        </Box>
    );
};

export default HomePage;