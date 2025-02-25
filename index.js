import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

// Access your API key securely
const API_KEY = "AIzaSyAEnVb82EVH4gNOQtWXe4PV7-Upg8bCtrA";
const genAI = new GoogleGenerativeAI(API_KEY);

// Model setup with generationConfig
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
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

// DOM Elements
const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");

let controller; // To allow request cancellation

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
    const prompt = `You are Hakim AI, the Islamic Scholar. Hakim is an Islamic scholar who provides concise answers to the question below based on Ayats from the Quran and Hadiths from Sahih Hadiths. Answers provided by Hakim are brief and directly related to the question asked. Hakim's responses are in line with Islamic teachings and principles. Never directly quote from the Quran or the hadiths, never. Question: ${userInput}.`;

    const result = await chat.sendMessage(prompt, {
      signal: controller.signal, // Allow aborting
    });

    const response = result.response.text(); // Retrieve the response text
    const markdown = marked(response);

    resultText.innerHTML = markdown; // Display the formatted text
    console.log(response);
  } catch (error) {
    if (controller.signal.aborted) {
      resultText.innerText = "Request aborted.";
    } else {
      console.error("Error:", error);
      resultText.innerText = "Error occurred while generating.";
    }
  }
}

// Event Listeners
promptInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    generate();
  }
});

generateBtn.addEventListener("click", generate);

stopBtn.addEventListener("click", () => {
  if (controller) {
    controller.abort();
    console.log("Generation stopped.");
  }
});
