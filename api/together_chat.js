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
    const response = await fetch('https://api.together.xyz/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: message,
        model: 'llama-3.2',  // Replace this with the model version in use
        temperature: 0.7, // Adjust as necessary
      })
    });
    
    const data = await response.json();
    res.status(200).json({ reply: data.response });
  } catch (error) {
    console.error('Error connecting to Together API:', error);
    res.status(500).json({ error: 'Failed to connect to Together API' });
  }
};
