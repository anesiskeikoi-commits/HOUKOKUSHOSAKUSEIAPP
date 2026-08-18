module.exports = async function handler(req, res) {
  // CORSヘッダーの設定（ブラウザからのアクセスを許可）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Vercelの環境変数に GEMINI_API_KEY が設定されていません。' });
    }

    const { prompt, images } = req.body || {};
    let parts = [{ text: prompt || "分析してください" }];

    // 画像データがある場合は組み立てる
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

    // 正しいモデル名（gemini-2.0-flash）でGoogle APIを呼び出す
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: parts }] })
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ error: data });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
