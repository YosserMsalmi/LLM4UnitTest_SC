package net.javaguides.springAi_ollama_app.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class TestValidationService {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path scriptPath;
    private final boolean isWindows;
    private final Path projectPath;

    public TestValidationService() {
        this.projectPath = Paths.get("src/main/resources/HardhatProject").toAbsolutePath();

        this.scriptPath = projectPath.resolve("check.js");        this.isWindows = System.getProperty("os.name").toLowerCase().contains("win");

        if (!Files.exists(scriptPath)) {
            throw new IllegalStateException("Script file not found: " + scriptPath);
        }
    }

    private List<String> buildCommand(String testContent) {
        List<String> cmd = new ArrayList<>();
        if (isWindows) {
            cmd.add("cmd.exe");
            cmd.add("/c");
        }
        cmd.add("node");
        cmd.add(scriptPath.toString());
        cmd.add(testContent); // Pass content directly
        return cmd;
    }

    public Map<String, Object> validateTestContent(String testFileName, String content) throws IOException, InterruptedException {
        try {
            // Create temp file to pass to check.js
            Path tempFile = Files.createTempFile("test-", ".js");
            Files.write(tempFile, content.getBytes(StandardCharsets.UTF_8));

            Process process = new ProcessBuilder()
                    .command(buildCommand(tempFile.toString()))
                    .redirectErrorStream(true)
                    .start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                    System.out.println("[CHECK.JS OUTPUT] " + line); // Print to terminal
                }
            }

            boolean completed = process.waitFor(10, TimeUnit.SECONDS);
            if (!completed) {
                process.destroy();
                throw new RuntimeException("Validation timed out");
            }

            // Clean up temp file
            Files.deleteIfExists(tempFile);

            return parseResults(output.toString(), testFileName);
        } catch (Exception e) {
            System.err.println("Validation error: " + e.getMessage());
            return Map.of(
                    "valid", false,
                    "error", "Validation failed: " + e.getMessage()
            );
        }
    }

    private Map<String, Object> parseResults(String jsonOutput, String originalFileName) throws IOException {
        try {
            Map<String, Object> result = objectMapper.readValue(jsonOutput, Map.class);
            result.put("originalFileName", originalFileName);

            System.out.println("\n=== VALIDATION RESULTS ===");
            System.out.println("File: " + originalFileName);
            System.out.println("Valid: " + result.get("valid"));
            System.out.println("Total Errors: " + result.get("totalErrors"));
            System.out.println("Total LOC: " + result.get("totalLinesOfCode"));
            System.out.println("Validation Metric: " + result.get("syntaxValidationMetric") + "%");

            if (result.containsKey("errors")) {
                List<Map<String, Object>> errors = (List<Map<String, Object>>) result.get("errors");
                System.out.println("\nDetailed Errors:");
                errors.forEach(err -> {
                    System.out.printf("Error: %s%n", err.get("message"));
                    if (err.containsKey("loc")) {
                        Map<String, Object> loc = (Map<String, Object>) err.get("loc");
                        System.out.printf("Location: Line %s, Column %s%n%n",
                                loc.get("line"), loc.get("column"));
                    }
                });
            }

            return result;
        } catch (Exception e) {
            System.err.println("Failed to parse results: " + e.getMessage());
            return Map.of(
                    "valid", false,
                    "error", "Failed to parse validation results: " + e.getMessage(),
                    "rawOutput", jsonOutput
            );
        }
    }
}