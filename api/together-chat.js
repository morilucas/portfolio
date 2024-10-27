// /api/together-chat.js
import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).send({ message: 'Message is required' });
  }

  try {
    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        prompt: message,
        max_tokens: 200,
        role: "assistant"
      })
    });
    
    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error connecting to Together API:', error);
    res.status(500).json({ error: 'Failed to connect to Together API' });
  }
};
