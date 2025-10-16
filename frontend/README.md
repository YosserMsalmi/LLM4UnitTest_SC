# LLM4UnitTests-SC

LLM4UnitTests-SC is a fullstack application for automatically generating unit tests for smart contracts using Large Language Models (LLMs). Users upload Solidity smart contracts along with relevant context files (e.g., testing instructions, context, requirements), and the app generates unit tests based on the input.

---

## Project Structure

The repository is organized into the following main folders:

### backend
**Description:** Spring Boot backend that processes uploaded files and communicates with a local LLM.  
**Tech Stack:** Java, Spring Boot.  
**Features:**
- Accepts file uploads (Solidity and text files)
- Sends content to Codestral via Ollama for unit test generation
- Exposes REST API for frontend

### frontend
**Description:** React.js application for user interaction.  
**Tech Stack:** React.js, Axios.  
**Features:**
- Upload Solidity smart contracts and related text files
- Trigger and display generated unit tests
- Simple and user-friendly UI

---

## Prerequisites

Before running the application, ensure the following are installed:

- **[Ollama](https://ollama.com/):** Local runtime for LLMs.
- **Codestral model:** You must have the Codestral model installed in Ollama.

Start Ollama and load the Codestral model:

```bash
ollama run codestral
