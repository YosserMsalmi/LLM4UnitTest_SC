package net.javaguides.springAi_ollama_app.service;

import net.javaguides.springAi_ollama_app.dto.TestGenerationRequest;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class LLMTestGenerationService {

    private final ChatModel chatModel;

    public LLMTestGenerationService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public Map<String, Object> generateTestFromPrompt(TestGenerationRequest requestData) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(requestData.getContext()).append("\n\n");
        promptBuilder.append("Solidity Code:\n").append(requestData.getSolidityCode()).append("\n\n");
        promptBuilder.append("Instructions:\n").append(requestData.getGeneralInstructions()).append("\n\n");
        promptBuilder.append("Requirements:\n").append(requestData.getRequirements()).append("\n\n");

        if (requestData.getExampleTest() != null && !requestData.getExampleTest().isEmpty()) {
            promptBuilder.append("Example Test:\n").append(requestData.getExampleTest()).append("\n\n");
        }

        String finalPrompt = promptBuilder.toString();
        System.out.println("Generated Prompt : " + finalPrompt);

        String result = chatModel.call(finalPrompt);
        System.out.println("Generated Test Code : " + result);

        Map<String, Object> response = new HashMap<>();
        response.put("generatedTest", result);

        return response;
    }
}
