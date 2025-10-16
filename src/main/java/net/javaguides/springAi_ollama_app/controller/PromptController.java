package net.javaguides.springAi_ollama_app.controller;

import org.springframework.ai.chat.model.ChatModel;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/prompt")
public class PromptController {

    private final ChatModel chatModel;


    public PromptController(ChatModel chatModel, HardhatController hardhatController) {
        this.chatModel = chatModel;

    }
    @PostMapping("/generate-test")
    public ResponseEntity<?> generateTest(@RequestBody Map<String, String> requestData) {
        String context = requestData.get("context");
        String generalInstructions = requestData.get("generalInstructions");
        String requirements = requestData.get("requirements");
        String exampleTest = requestData.get("exampleTest");
        String solidityCode = requestData.get("solidityCode");
        String abiJson = requestData.get("abiJson");

        // Construire dynamiquement le prompt
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(context).append("\n\n");
        promptBuilder.append("Solidity Code:\n").append(solidityCode).append("\n\n");
        promptBuilder.append("Instructions:\n").append(generalInstructions).append("\n\n");
        promptBuilder.append("Requirements:\n").append(requirements).append("\n\n");

        if ( exampleTest != null && !exampleTest.isEmpty()) {
            promptBuilder.append("Example Test:\n").append(exampleTest).append("\n\n");
        }

        String finalPrompt = promptBuilder.toString();
        System.out.println("Generated Prompt : " + finalPrompt);

        String result = chatModel.call(finalPrompt);
        System.out.println("Generated Test Code : " + result);


        // Combine both generated code and test output in the response
        Map<String, Object> response = new HashMap<>();
        response.put("generatedTest", result);

        return ResponseEntity.ok(response);
    }

}
