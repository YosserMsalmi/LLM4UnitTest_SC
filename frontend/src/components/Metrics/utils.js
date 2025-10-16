import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFReport = (testResults, setIsGeneratingPDF) => {
    setIsGeneratingPDF(true);

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

    // Add test results table
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

export const calculateTestSummary = (testResults) => {
    return {
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
};