package net.javaguides.springAi_ollama_app.dto;

import javax.validation.constraints.NotNull;


public class TestGenerationRequest {

    @NotNull
    private String context;

    @NotNull
    private String generalInstructions;

    @NotNull
    private String requirements;

    private String exampleTest;

    @NotNull
    private String solidityCode;


    // Getters and Setters
    public String getContext() {
        return context;
    }


    public String getGeneralInstructions() {
        return generalInstructions;
    }

    public void setGeneralInstructions(String generalInstructions) {
        this.generalInstructions = generalInstructions;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getExampleTest() {
        return exampleTest;
    }

    public void setExampleTest(String exampleTest) {
        this.exampleTest = exampleTest;
    }

    public String getSolidityCode() {
        return solidityCode;
    }

    public void setSolidityCode(String solidityCode) {
        this.solidityCode = solidityCode;
    }

}
