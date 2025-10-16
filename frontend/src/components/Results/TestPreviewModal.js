import React from 'react';
import { Modal, Paper, Box, Typography, Button, Tooltip, TextField } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TestPreviewModal = ({
                              modalOpen,
                              setModalOpen,
                              isEditing,
                              setIsEditing,
                              editedTest,
                              setEditedTest,
                              testInfo = {},
                              setTestInfo,
                              handleCopyToClipboard
                          }) => {
    const extractJavaScriptCode = (code) => {
        if (!code) return '// No test generated yet...';
        const match = code.match(/```javascript\n([\s\S]*?)\n```/);
        return match ? match[1].trim() : code;
    };

    return (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Paper sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                maxHeight: '80vh',
                p: 3,
                overflow: 'hidden',
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
                    <Box sx={{
                        overflow: 'auto',
                        maxHeight: '60vh',
                        border: '1px solid #2d2d2d',
                        borderRadius: '4px'
                    }}>
                        <SyntaxHighlighter
                            language="javascript"
                            style={atomDark}
                            showLineNumbers
                            wrapLines
                            lineNumberStyle={{
                                minWidth: '2.5em',
                                paddingRight: '1em',
                                color: '#858585',
                                userSelect: 'none'
                            }}
                            customStyle={{
                                margin: 0,
                                padding: '16px',
                                fontSize: '0.875rem',
                                backgroundColor: '#1d1f21',
                                fontFamily: '"Fira Code", "Roboto Mono", monospace'
                            }}
                            codeTagProps={{
                                style: {
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit'
                                }
                            }}
                        >
                            {extractJavaScriptCode(testInfo?.generatedTest)}
                        </SyntaxHighlighter>
                    </Box>
                )}
            </Paper>
        </Modal>
    );
};

export default TestPreviewModal;