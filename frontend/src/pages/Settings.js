import { Box, Button, Typography, Paper, Divider, Stack, Chip, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import ComputerIcon from '@mui/icons-material/Computer';
import DescriptionIcon from '@mui/icons-material/Description';

const Settings = () => {
    const navigate = useNavigate();
    const [activeSidebarItem, setActiveSidebarItem] = useState('settings');

    const handleSidebarNavigation = (item) => {
        setActiveSidebarItem(item);
        if (item === 'home') navigate('/');
        else if (item === 'results') navigate('/results');
        else if (item === 'metrics') navigate('/metrics');
    };

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            p: 2,
            gap: 2
        }}>
            {/* Sidebar */}
            <Paper sx={{ width: 250, bgcolor: '#EAEAEA', p: 2, borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
                <Button fullWidth variant="outlined" sx={{ mb: 2 }}  onClick={() => handleSidebarNavigation('home')}>Home</Button>
                <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('results')}>Test Execution</Button>
                <Button fullWidth variant="outlined" sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('metrics')}>Test Metrics</Button>
                <Button fullWidth variant={activeSidebarItem === 'settings' ? 'contained' : 'outlined'} sx={{ mb: 2 }} onClick={() => handleSidebarNavigation('settings')}>Environment Details</Button>
            </Paper>

            {/* Main Content */}
            <Paper sx={{
                flex: 1,
                bgcolor: '#EAEAEA',
                borderRadius: '10px',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                boxShadow: 3
            }}>
                <Typography variant="h4">

                    Environment Details
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={4}>
                    {/* Smart Contract Development */}
                    <Box sx={{
                        p: 3,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1
                    }}>
                        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CodeIcon color="primary" />
                            Smart Contract Development
                        </Typography>
                        <Stack spacing={1} sx={{ pl: 4 }}>
                            <Typography>
                                <strong>Solidity Version:</strong> <Chip label="0.8.x" size="small" color="primary" />
                            </Typography>
                            <Typography>
                                <strong>Hardhat Version:</strong> <Chip label="2.23.0" size="small" color="primary" />
                            </Typography>
                        </Stack>
                    </Box>

                    {/* LLM Configuration */}
                    <Box sx={{
                        p: 3,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1
                    }}>
                        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ComputerIcon color="primary" />
                            LLM Configuration
                        </Typography>
                        <Stack spacing={1} sx={{ pl: 4 }}>
                            <Typography>
                                <strong>LLM Engine:</strong> <Link href="https://ollama.com" target="_blank" rel="noopener noreferrer" color="secondary">Ollama</Link>
                            </Typography>
                            <Typography>
                                <strong>Model Used:</strong> <Chip label="codestral:22b" size="small" color="secondary" />
                            </Typography>
                        </Stack>

                        {/* Codestral Description */}
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            borderLeft: '4px solid',
                            borderColor: 'secondary.main'
                        }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Codestral 22b Description:</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Codestral is a cutting-edge 22B parameter language model specifically fine-tuned for code generation and understanding.
                                Key features include:
                            </Typography>
                            <Box component="ul" sx={{
                                pl: 2,
                                mt: 1,
                                color: 'text.secondary',
                                '& li': { mb: 1 }
                            }}>
                                <Box component="li">
                                    <Typography variant="body2">
                                        Specialized in 80+ programming languages
                                    </Typography>
                                </Box>
                                <Box component="li">
                                    <Typography variant="body2">
                                        32k token context window for handling large codebases
                                    </Typography>
                                </Box>
                                <Box component="li">
                                    <Typography variant="body2">
                                        Optimized for code completion and explanation
                                    </Typography>
                                </Box>
                                <Box component="li">
                                    <Typography variant="body2">
                                        Strong performance on code-related benchmarks
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" sx={{
                                display: 'block',
                                mt: 1,
                                fontStyle: 'italic'
                            }}>
                                Model weights available via Ollama with <CodeIcon fontSize="inherit" /> pull codestral:22b
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default Settings;