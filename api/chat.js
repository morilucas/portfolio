export default async function handler(req, res) {
    // Handle the preflight request
    if (req.method === 'OPTIONS') {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust to your needs
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.status(200).end(); // End the OPTIONS request here
    }

    // Only allow POST requests for the main functionality
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { message } = req.body;
  
    try {
        const response = await fetch("https://api.together.xyz/v1/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                prompt: message,
                max_tokens: 200,
                role: "assistant"
            }),
        });

        const data = await response.json();
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow CORS for the POST response
        res.status(200).json(data);
    } catch (error) {
        console.error("Error during API fetch:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
