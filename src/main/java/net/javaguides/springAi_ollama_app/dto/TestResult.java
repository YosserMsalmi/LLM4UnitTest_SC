
package net.javaguides.springAi_ollama_app.dto;

import java.util.List;
import java.util.Map;

public class TestResult {
    private final String fullOutput;

    private final Map<String, String> coverageStats;
    private final int passingTestsCount;
    private final int failingTestsCount;
    private final List<String> passedTests;
    private final List<String> failedTests;

    public TestResult(String fullOutput, Map<String, String> coverageStats, int passingTestsCount, int failingTestsCount, List<String> passedTests, List<String> failedTests) {
        this.fullOutput = fullOutput;
        this.coverageStats = coverageStats;
        this.passingTestsCount = passingTestsCount;
        this.failingTestsCount = failingTestsCount;
        this.passedTests = passedTests;
        this.failedTests = failedTests;
    }

    public String getFullOutput() {
        return fullOutput;
    }

    public Map<String, String> getCoverageStats() {
        return coverageStats;
    }

    public int getPassingTestsCount() {
        return passingTestsCount;
    }

    public int getFailingTestsCount() {
        return failingTestsCount;
    }

    public List<String> getPassedTests() {
        return passedTests;
    }

    public List<String> getFailedTests() {
        return failedTests;
    }
}

