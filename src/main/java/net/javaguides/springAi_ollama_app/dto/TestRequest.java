package net.javaguides.springAi_ollama_app.dto;


import javax.validation.constraints.NotEmpty;  // Import this for the @NotEmpty annotation


public class TestRequest {
    private String solidityCode;
    private String testCode;

    public String getSolidityCode() {
        return solidityCode;
    }

    public void setSolidityCode(String solidityCode) {
        this.solidityCode = solidityCode;
    }

    public String getTestCode() {
        return testCode;
    }

    public void setTestCode(String testCode) {
        this.testCode = testCode;
    }

    // Add toString() for better logging
    @Override
    public String toString() {
        return "TestRequest{" +
                "solidityCode='" + solidityCode + '\'' +
                ", testCode='" + testCode + '\'' +
                '}';
    }
}