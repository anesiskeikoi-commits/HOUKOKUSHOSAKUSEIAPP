export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key not set' });

    const { prompt, images } = req.body;
    let parts = [{ text: prompt || "分析してください" }];

    if (images && Array.isArray(images)) {
      images.forEach(img => {
        parts.push({
          inlineData: {
            mimeType: img.mimeType || "image/jpeg",
            data: img.data
          }
        });
      });
    }

    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: parts }] })
      }
    );

    const data = await googleResponse.json();
    return res.status(googleResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
