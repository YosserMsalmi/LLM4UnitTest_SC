import React from 'react';
import {
    Paper,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const TestCases = ({ testResults }) => {
    const passedTests = testResults.summary?.testsPassed || [];
    const failedTests = testResults.summary?.testsFailed || [];

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Test Cases</Typography>

            {/* Passed Tests */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" />
                        <Typography>Passed Tests ({passedTests.length})</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <List dense>
                        {passedTests.map((test, index) => (
                            <ListItem key={`passed-${index}`}>
                                <ListItemIcon>
                                    <CheckCircleIcon color="success" />
                                </ListItemIcon>
                                <ListItemText primary={test} />
                            </ListItem>
                        ))}
                        {passedTests.length === 0 && (
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
                        <Typography>Failed Tests ({failedTests.length})</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <List dense>
                        {failedTests.map((test, index) => (
                            <ListItem key={`failed-${index}`}>
                                <ListItemIcon>
                                    <ErrorIcon color="error" />
                                </ListItemIcon>
                                <ListItemText primary={test} />
                            </ListItem>
                        ))}
                        {failedTests.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                                No tests failed
                            </Typography>
                        )}
                    </List>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

export default TestCases;