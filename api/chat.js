// /api/chat.js
export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { prompt } = req.body;

	try {
		const response = await fetch("https://api.together.xyz/v1/completions", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
				prompt: prompt,
				max_tokens: 200,
				role: "assistant",
			}),
		});

		const data = await response.json();
		res.status(response.ok ? 200 : response.status).json(data);
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}
