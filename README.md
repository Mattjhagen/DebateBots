# Gemini Live API Demo - Debate & Companion

This application demonstrates the capabilities of the Google Gemini Live API. It features two distinct modes:

1.  **Companion Mode**: A helpful AI assistant that listens and responds in real-time using low-latency audio streaming.
2.  **Debate Mode**: An autonomous debate arena where two AI agents (with distinct personalities) argue a topic provided by the user. They listen to each other via audio transcription and generate witty rebuttals in real-time.

## Features

- **Real-time Multimodal Interaction**: Uses WebSocket-based streaming for audio input and output.
- **Debate Orchestration**: Handles two simultaneous Live API connections that "listen" to each other via transcription events.
- **Visual Avatars**: Canvas-based reactive faces that animate based on audio volume (mouth movement) and random blinking logic.
- **Customizable Personalities**: Agents have distinct system instructions and voice configurations (e.g., "Proper Paul" vs "Chic Charlotte").

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Google GenAI API Key**: Obtain a paid API key from [Google AI Studio](https://aistudio.google.com/).
  - *Note: Ensure your project has access to the `gemini-2.5-flash-native-audio-preview-12-2025` model.*

## Setup & Installation

1.  **Install Dependencies**
    
    If using a standard bundler (like Vite or Webpack), ensure you have the necessary packages installed:
    ```bash
    npm install react react-dom @google/genai eventemitter3 lodash classnames zustand
    npm install -D typescript vite @types/react @types/react-dom
    ```

2.  **Configure Environment Variables**

    Create a `.env` file in the root directory of your project. This file should contain your API Key. The application is configured to read `process.env.API_KEY`.

    ```env
    API_KEY=your_actual_api_key_here
    ```

    *Note: If using Vite, you may need to adjust the code to use `import.meta.env.VITE_API_KEY` or configure your `vite.config.ts` to expose the `API_KEY` define.*

3.  **Run the Application**

    Start your development server:
    ```bash
    npm run dev
    ```

4.  **Access the App**
    Open your browser and navigate to the local server address (usually `http://localhost:5173` or `http://localhost:3000`).

## Usage

### Debate Mode (Head-to-Head)
1. Click the **Debate Mode** icon (speech bubbles) in the bottom-left floating menu.
2. Type a controversial topic into the input field (e.g., "Pineapple on Pizza", "Tabs vs Spaces").
3. Click **Start Debate**.
4. The two agents will connect. Agent A (Left) will make an opening statement. Agent B (Right) will receive the transcript, "hear" it, and generate a rebuttal. This cycle continues automatically.
5. Click **End Debate** to disconnect both sessions.

### Companion Mode
1. Click the **Companion Mode** icon (person) in the bottom-left floating menu.
2. Use the **Connect** (Play button) in the bottom control tray to start the session.
3. Speak naturally. The AI will respond with low latency.
4. Use the **Edit** button in the header to change the agent's voice or personality instructions.

## Troubleshooting

- **404 Model Not Found**: Ensure you are using the correct model name (`gemini-2.5-flash-native-audio-preview-12-2025`) and that your API key is valid for this preview model.
- **Connection Errors**: Check the browser console. If you see `403` errors, your API key might be invalid or lacking permissions.
- **Audio Issues**: Ensure you have granted microphone permissions to the browser.
