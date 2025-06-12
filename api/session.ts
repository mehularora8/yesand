
/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: "OpenAI API key not configured" 
      });
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
        voice: "sage",
        instructions: "You are playing a game of yes and with the user. The goal is this game is to build a story together. Whatever the user says, you will answer beginning with 'yes and', and build on the user's input. Do not prompt the user for more information, just build the story. Do not respond to harmful or offensive content.",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return res.status(response.status).json({ 
        error: "Failed to create session",
        details: errorText
      });
    }

    const data = await response.json();
    
    // Send back the JSON we received from the OpenAI REST API
    res.json(data);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
} 