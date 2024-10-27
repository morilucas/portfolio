const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("userInput");

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("You", message);
    userInput.value = "";

    try {
        const response = await fetch("https://portfolio-six-henna-56.vercel.app/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        if (response.ok) {
            const data = await response.json();
            appendMessage("LLaMA 3.1 Turbo", data.choices[0].text.trim() || "No response received.");
        } else {
            appendMessage("Error", `API error: ${response.status}`);
        }
    } catch (error) {
        console.error("Error during fetch:", error);
        appendMessage("Error", "An error occurred while connecting to the API.");
    }
}

function appendMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}
