const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("userInput");

async function sendMessage() {
	const message = userInput.value.trim();
	if (!message) return;

	appendMessage("You", message);
	userInput.value = "";

	try {
		const response = await fetch("https://api.together.xyz/v1/completions", {
			method: "POST",
			headers: {
				"Authorization": "Bearer afd8254bc26c23fd1b4f7269bd73e82f59edc47e6adb4d74d35acf6d2738fec4",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
				prompt: message,
				max_tokens: 200, // Adjust as needed for response length
                role: "assistant"
			}),
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
