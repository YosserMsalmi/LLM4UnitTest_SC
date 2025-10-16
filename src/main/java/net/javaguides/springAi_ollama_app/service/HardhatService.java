package net.javaguides.springAi_ollama_app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.javaguides.springAi_ollama_app.dto.*;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HardhatService {
    private final Path projectPath;
    private final Path contractsPath;
    private final Path testsPath;
    private final Path coveragePath;
    private final Path coverageJsonPath;
    private final boolean isWindows;
    private final ObjectMapper objectMapper;

    public HardhatService() {
        this.isWindows = System.getProperty("os.name").toLowerCase().contains("win");
        this.projectPath = Paths.get("src/main/resources/HardhatProject").toAbsolutePath();
        this.contractsPath = projectPath.resolve("contracts");
        this.testsPath = projectPath.resolve("test");
        this.coveragePath = projectPath.resolve("coverage");
        this.coverageJsonPath = coveragePath.resolve("coverage-final.json");
        this.objectMapper = new ObjectMapper();

        validateProjectStructure();
    }

    private void validateProjectStructure() {
        if (!Files.exists(projectPath)) {
            throw new RuntimeException("Hardhat project not found at: " + projectPath);
        }
    }

    public TestResult runTestsWithCoverage(String solidityCode, String testCode) throws IOException, InterruptedException {
        try {
            setupProjectFiles(solidityCode, testCode);

            // Execute coverage command (which includes tests)
            String combinedOutput = executeHardhatCommand("coverage");

            // Get the test analysis from output
            List<String> passedTests = new ArrayList<>();
            List<String> failedTests = new ArrayList<>();
            int passedTestsCount = 0;
            int failedTestsCount = 0;

            String[] lines = combinedOutput.split("\n");
            boolean reachedSummary = false;

            for (String line : lines) {
                line = line.trim();

                // Stop parsing once we reach the summary line
                if (line.matches("^\\d+ passing.*") || line.matches("^\\d+ failing.*")) {
                    reachedSummary = true;
                    continue;
                }
                if (reachedSummary) continue;

                // Passed test
                if (line.startsWith("√")) {
                    passedTests.add(line.substring(1).trim());
                    passedTestsCount++;
                }
                // Failed test
                else if (line.matches("^\\d+\\)\\s+.+")) {
                    failedTests.add(line.replaceFirst("^\\d+\\)\\s*", "").trim());
                    failedTestsCount++;
                }
            }

            // Get coverage from JSON file
            Map<String, String> coverageStats = parseCoverageResults();

            return new TestResult(
                    combinedOutput,
                    coverageStats,  // Use JSON-based coverage stats
                    passedTestsCount,
                    failedTestsCount,
                    passedTests,
                    failedTests
            );
        } finally {
            cleanupProject();
        }
    }

    private String executeHardhatCommand(String command) throws IOException, InterruptedException {
        List<String> cmd = buildCommand(command);
        System.out.println("Executing command: " + String.join(" ", cmd));

        ProcessBuilder builder = new ProcessBuilder()
                .command(cmd)
                .directory(projectPath.toFile())
                .redirectErrorStream(true);

        Process process = builder.start();
        String output = readProcessOutput(process);

        int exitCode = process.waitFor();
        System.out.println("Process exited with code: " + exitCode);

        return output;
    }

    private void setupProjectFiles(String solidityCode, String testCode) throws IOException {
        createDirectoriesIfNotExist();

        Path contractFile = contractsPath.resolve("MyContract.sol");
        Files.writeString(contractFile, solidityCode);

        Path testFile = testsPath.resolve("MyTest.js");
        Files.writeString(testFile, testCode);
    }

    private void createDirectoriesIfNotExist() throws IOException {
        if (!Files.exists(contractsPath)) Files.createDirectories(contractsPath);
        if (!Files.exists(testsPath)) Files.createDirectories(testsPath);
    }

    private List<String> buildCommand(String command) {
        List<String> cmd = new ArrayList<>();
        if (isWindows) {
            cmd.add("cmd.exe");
            cmd.add("/c");
        }
        cmd.add("npx");
        cmd.add("hardhat");
        cmd.add(command);
        return cmd;
    }

    private Map<String, String> parseCoverageResults() throws IOException {
        if (!Files.exists(coverageJsonPath)) {
            throw new IOException("Coverage report not found at: " + coverageJsonPath);
        }

        JsonNode rootNode = objectMapper.readTree(coverageJsonPath.toFile());
        CoverageStats stats = new CoverageStats();

        rootNode.fields().forEachRemaining(entry -> {
            JsonNode contractNode = entry.getValue();
            stats.processStatements(contractNode.path("s"));
            stats.processBranches(contractNode.path("b"));
            stats.processFunctions(contractNode.path("f"));
            stats.processLines(contractNode.path("l"));
        });

        return stats.getCoverageResults();
    }

    private String readProcessOutput(Process process) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private void cleanupProject() throws IOException {
        deleteFilesInDirectory(contractsPath);
        deleteFilesInDirectory(testsPath);
        deleteDirectoryIfExists(coveragePath);
        deleteDirectoryIfExists(projectPath.resolve("artifacts"));
        deleteDirectoryIfExists(projectPath.resolve("cache"));
    }

    private void deleteFilesInDirectory(Path directory) throws IOException {
        if (!Files.exists(directory)) return;

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory)) {
            for (Path file : stream) {
                if (!Files.isDirectory(file)) {
                    Files.delete(file);
                }
            }
        }
    }

    private void deleteDirectoryIfExists(Path path) throws IOException {
        if (Files.exists(path)) {
            Files.walk(path)
                    .sorted(Comparator.reverseOrder())
                    .forEach(file -> {
                        try {
                            Files.delete(file);
                        } catch (IOException e) {
                            System.err.println("Failed to delete " + file + ": " + e.getMessage());
                        }
                    });
        }
    }

    private static class CoverageStats {
        private int totalStatements = 0;
        private int coveredStatements = 0;
        private int totalBranches = 0;
        private int coveredBranches = 0;
        private int totalFunctions = 0;
        private int coveredFunctions = 0;
        private int totalLines = 0;
        private int coveredLines = 0;

        void processStatements(JsonNode statements) {
            statements.forEach(count -> {
                totalStatements++;
                if (count.asInt() > 0) coveredStatements++;
            });
        }

        void processBranches(JsonNode branches) {
            branches.forEach(branch -> branch.forEach(count -> {
                totalBranches++;
                if (count.asInt() > 0) coveredBranches++;
            }));
        }

        void processFunctions(JsonNode functions) {
            functions.forEach(count -> {
                totalFunctions++;
                if (count.asInt() > 0) coveredFunctions++;
            });
        }

        void processLines(JsonNode lines) {
            lines.forEach(count -> {
                totalLines++;
                if (count.asInt() > 0) coveredLines++;
            });
        }

        Map<String, String> getCoverageResults() {
            Map<String, String> results = new LinkedHashMap<>();
            results.put("statements", calculatePercentage(coveredStatements, totalStatements));
            results.put("branches", calculatePercentage(coveredBranches, totalBranches));
            results.put("functions", calculatePercentage(coveredFunctions, totalFunctions));
            results.put("lines", calculatePercentage(coveredLines, totalLines));
            return results;
        }

        private String calculatePercentage(int covered, int total) {
            return total == 0 ? "0.00" : String.format("%.2f", (100.0 * covered) / total);
        }
    }
}
