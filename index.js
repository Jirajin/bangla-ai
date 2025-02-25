import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

// Access your API key securely
const API_KEY = "AIzaSyDCioCj-jFbLZOdIzgwpXudxA94fVMS4-c";
const genAI = new GoogleGenerativeAI(API_KEY);

// Model setup with generationConfig
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const promptInput = document.getElementById("promptInput");
  const generateBtn = document.getElementById("generateBtn");
  const resultText = document.getElementById("resultText");
  const stopBtn = document.getElementById("stopBtn");

  let controller; // To allow request cancellation

  // Add custom CSS for the result text to ensure single column layout
  const style = document.createElement('style');
  style.textContent = `
    #resultText {
      column-count: 1 !important;
      column-span: all !important;
      display: block !important;
      width: 100% !important;
    }
  `;
  document.head.appendChild(style);

  // Prevent the default form submission
  if (document.getElementById('email-form-2')) {
    document.getElementById('email-form-2').addEventListener('submit', function(e) {
      e.preventDefault(); // This prevents the form from actually submitting
      generate();
    });
  }

  async function generate() {
    resultText.innerText = "Generating...";
    
    controller = new AbortController(); // Signal for aborting request if needed
    const userInput = promptInput.value;

    try {
      const chat = model.startChat({
        generationConfig,
        safetySettings,
      });

      // Structured prompt
      const prompt = ` Question: ${userInput}.`;

      const result = await chat.sendMessage(prompt, {
        signal: controller.signal, // Allow aborting
      });

      const response = result.response.text(); // Retrieve the response text
      const markdown = marked(response);

      resultText.innerHTML = markdown; // Display the formatted text
      console.log(response);
    } catch (error) {
      if (controller && controller.signal.aborted) {
        resultText.innerText = "Request aborted.";
      } else {
        console.error("Error:", error);
        resultText.innerText = "Error occurred while generating.";
      }
    }
  }

  // Event Listeners
  if (promptInput) {
    promptInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        generate();
        promptInput.value = ""; // Clear the input field
      }
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", function(e) {
      e.preventDefault(); // Prevent any default behavior
      generate();
      promptInput.value = ""; // Clear the input field
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener("click", () => {
      if (controller) {
        controller.abort();
        console.log("Generation stopped.");
      }
    });
  }
});