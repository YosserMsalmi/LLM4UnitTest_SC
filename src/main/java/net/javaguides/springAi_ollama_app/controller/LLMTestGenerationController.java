package net.javaguides.springAi_ollama_app.controller;

import net.javaguides.springAi_ollama_app.dto.TestGenerationRequest;
import net.javaguides.springAi_ollama_app.service.LLMTestGenerationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api/llm")
public class LLMTestGenerationController {

    private final LLMTestGenerationService testGenerationService;

    public LLMTestGenerationController(LLMTestGenerationService testGenerationService) {
        this.testGenerationService = testGenerationService;
    }

    @PostMapping("/generate-test")
    public ResponseEntity<?> generateTest(@RequestBody TestGenerationRequest requestData) {
        Map<String, Object> response = testGenerationService.generateTestFromPrompt(requestData);
        return ResponseEntity.ok(response);
    }
}
