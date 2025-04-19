const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const languageSelector = document.getElementById("languageSelector");

const GEMINI_API_KEY = "AIzaSyBRKADstSQwAI8qCjvTUTLxGqXrPWxfIAo";

// Typing effect placeholder
function showTypingEffect() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("bot-message", "typing-effect");
  typingDiv.innerHTML = `<span class="typing"></span> Bot is thinking...`;
  chat.appendChild(typingDiv);
  return typingDiv;
}

// Translate user input before sending to Gemini
async function translateToEnglish(text, sourceLang) {
  if (sourceLang === "en") return text;
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=YOUR_GOOGLE_TRANSLATE_API_KEY`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: sourceLang, target: "en", format: "text" }),
  });
  const data = await response.json();
  return data.data.translations[0].translatedText;
}

// Translate Gemini's response back to user language
async function translateToUserLang(text, targetLang) {
  if (targetLang === "en") return text;
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=YOUR_GOOGLE_TRANSLATE_API_KEY`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "en", target: targetLang, format: "text" }),
  });
  const data = await response.json();
  return data.data.translations[0].translatedText;
}

async function sendMessage() {
  const input = userInput.value.trim();
  const selectedLang = languageSelector.value;
  if (!input) return;

  // Show user message
  const userMessage = document.createElement("div");
  userMessage.classList.add("user-message");
  userMessage.innerText = input;
  chat.appendChild(userMessage);

  // Typing animation
  const typingDiv = showTypingEffect();

  // Translate if needed
  const translatedInput = await translateToEnglish(input, selectedLang);

  // Call Gemini API
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: translatedInput }] }],
      }),
    }
  );

  const data = await res.json();
  const reply = data.candidates[0]?.content?.parts[0]?.text || "Sorry, I didn't understand that.";

  // Translate back if needed
  const finalReply = await translateToUserLang(reply, selectedLang);

  // Remove typing animation
  typingDiv.remove();

  // Show bot response
  const botMessage = document.createElement("div");
  botMessage.classList.add("bot-message");
  botMessage.innerText = finalReply;
  chat.appendChild(botMessage);

  userInput.value = "";
}

// Handle send button click
sendBtn.addEventListener("click", sendMessage);

// Handle voice input
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
micBtn.addEventListener("click", () => {
  recognition.lang = languageSelector.value === "hi" ? "hi-IN" : languageSelector.value === "ta" ? "ta-IN" : "en-US";
  recognition.start();
});
recognition.onresult = function (event) {
  const transcript = event.results[0][0].transcript;
  userInput.value = transcript;
};
document.querySelectorAll('.option-btn').forEach(button => {
    button.addEventListener('click', () => {
      const userResponse = button.textContent;
      const chat = document.getElementById('chat');
  
      // Append user response
      const userMsg = document.createElement('div');
      userMsg.className = 'user-message';
      userMsg.textContent = userResponse;
      chat.appendChild(userMsg);
  
      // Add your response logic here...
    });
  });
  