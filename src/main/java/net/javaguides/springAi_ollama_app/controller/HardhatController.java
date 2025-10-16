package net.javaguides.springAi_ollama_app.controller;

import net.javaguides.springAi_ollama_app.dto.TestRequest;
import net.javaguides.springAi_ollama_app.dto.TestResult;
import net.javaguides.springAi_ollama_app.service.HardhatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class HardhatController {

    @Autowired
    private HardhatService hardhatService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);

    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> runTests(@RequestBody TestRequest request) {
        Map<String, Object> response = new LinkedHashMap<>();

        try {
            System.out.printf("Exécution du contrat Solidity (%d caractères) avec suite de tests (%d caractères)%n",
                    request.getSolidityCode().length(),
                    request.getTestCode().length());

            TestResult testResult = hardhatService.runTestsWithCoverage(
                    request.getSolidityCode(),
                    request.getTestCode()
            );

            // Log raw output to terminal first
            System.out.println("\n=== RAW TEST OUTPUT ===");
            System.out.println(testResult.getFullOutput());
            System.out.println("=======================\n");

            // Construction de la réponse structurée
            response.put("status", "success");

            // Section de résumé
            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("contract", "MyContract.sol");
            summary.put("test", "MyTest.sol");
            summary.put("TestsPassedCount", testResult.getPassingTestsCount());
            summary.put("testsFailedCount",testResult.getFailingTestsCount());
            summary.put("testsPassed", testResult.getPassedTests());
            summary.put("testsFailed", testResult.getFailedTests());
            summary.put("totalTests", testResult.getPassingTestsCount() + testResult.getFailingTestsCount());
            response.put("rawOutput", testResult.getFullOutput());
            response.put("summary", summary);

            // Section de couverture
            Map<String, Object> coverage = new LinkedHashMap<>();
            coverage.put("statements", testResult.getCoverageStats().get("statements") + "%");
            coverage.put("branches", testResult.getCoverageStats().get("branches") + "%");
            coverage.put("functions", testResult.getCoverageStats().get("functions") + "%");
            coverage.put("lines", testResult.getCoverageStats().get("lines") + "%");
            response.put("coverage", coverage);





            // Log the response that will be sent to frontend
            logResponse("Response being sent to frontend:", response);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.printf("Erreur d'exécution des tests: %s%n", e.getMessage());
            e.printStackTrace();

            response.put("status", "error");
            response.put("message", "Échec de l'exécution des tests");
            response.put("error", e.getClass().getSimpleName() + ": " + e.getMessage());

            if (System.getenv("ENV") != null && System.getenv("ENV").equals("dev")) {
                response.put("debug", Map.of(
                        "solidityCodeLength", request.getSolidityCode().length(),
                        "testCodeLength", request.getTestCode().length()
                ));
            }

            // Log error response
            logResponse("Error response being sent to frontend:", response);

            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = Map.of(
                "status", "actif",
                "service", "hardhat-test-runner",
                "version", "2.1",
                "description", "Version avec réponse structurée et gestion améliorée des erreurs"
        );

        // Log health check response
        logResponse("Health check response:", response);

        return ResponseEntity.ok(response);
    }

    private void logResponse(String message, Object response) {
        try {
            System.out.println("\n" + message);
            System.out.println(objectMapper.writeValueAsString(response));
            System.out.println();
        } catch (JsonProcessingException e) {
            System.err.println("Failed to log response: " + e.getMessage());
            System.out.println(response.toString());
        }
    }
}
