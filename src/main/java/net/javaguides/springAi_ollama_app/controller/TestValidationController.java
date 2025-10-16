package net.javaguides.springAi_ollama_app.controller;

import net.javaguides.springAi_ollama_app.service.TestValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "http://localhost:3000")
public class TestValidationController {

    private final TestValidationService validationService;

    public TestValidationController(TestValidationService validationService) {
        this.validationService = validationService;
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateTest(
            @RequestParam String fileName,
            @RequestBody String testCode) {

        System.out.println("\n=== NEW VALIDATION REQUEST ===");
        System.out.println("Validating file: " + fileName);
        System.out.println("Test code length: " + testCode.length() + " characters");

        try {
            // Log first 200 chars of the test code for debugging
            String preview = testCode.length() > 200 ?
                    testCode.substring(0, 200) + "..." : testCode;
            System.out.println("Code preview:\n" + preview);

            Map<String, Object> validationResult = validationService.validateTestContent(fileName, testCode);

            // Transform the result to match frontend expectations
            return ResponseEntity.ok().body(transformResult(validationResult));

        } catch (Exception e) {
            System.err.println("Validation error: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", e.getMessage(),
                            "status", "error"
                    ));
        }
    }

    private Map<String, Object> transformResult(Map<String, Object> rawResult) {
        Map<String, Object> transformed = new LinkedHashMap<>();

        // Copy all fields from the raw result
        transformed.putAll(rawResult);

        // Ensure consistent field names for frontend
        if (!rawResult.containsKey("errors") && rawResult.containsKey("error")) {
            transformed.put("errors", List.of(
                    Map.of("message", rawResult.get("error"))
            ));
        }

        // Calculate validation percentage if not present
        if (!rawResult.containsKey("syntaxValidationMetric") &&
                rawResult.containsKey("totalLinesOfCode") &&
                rawResult.containsKey("totalErrors")) {

            int totalLines = (int) rawResult.get("totalLinesOfCode");
            int totalErrors = (int) rawResult.get("totalErrors");
            double metric = (1 - (double) totalErrors / totalLines) * 100;

            transformed.put("syntaxValidationMetric", String.format("%.2f", metric));
        }

        // Add status field for frontend
        transformed.put("status",
                Boolean.TRUE.equals(rawResult.get("valid")) ? "success" : "error");

        System.out.println("Transformed result: " + transformed);
        return transformed;
    }
}