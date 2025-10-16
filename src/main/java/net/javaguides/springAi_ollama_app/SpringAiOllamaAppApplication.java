package net.javaguides.springAi_ollama_app;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class SpringAiOllamaAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringAiOllamaAppApplication.class, args);
	}

}
