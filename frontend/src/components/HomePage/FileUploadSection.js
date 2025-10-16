import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const FileUploadSection = ({ solidityFile, onFileUpload }) => {
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            onFileUpload(e.target?.result);
        };
        reader.readAsText(file);
    };

    return (
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
    );
};

export default FileUploadSection;