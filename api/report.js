export default async function handler(req, res) {
  // CORSヘッダーの設定（エラー防止）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key not set in Vercel' });
    }

    const { prompt, images, memo } = req.body;

    // Geminiへ送るリクエストの中身を組み立てる
    let contents = [];

    if (images && Array.isArray(images) && images.length > 0) {
      // 写真＋プロンプトの場合
      const parts = [{ text: prompt || "分析してください" }];
      images.forEach(img => {
        parts.push({
          inlineData: {
            mimeType: img.mimeType || "image/jpeg",
            data: img.data
          }
        });
      });
      contents = [{ role: "user", parts: parts }];
    } else {
      // テキストのみの場合
      contents = [{ role: "user", parts: [{ text: prompt || memo || "" }] }];
    }

    // Google Gemini API にリクエストを送信
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: contents })
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ error: data });
    }

    // クライアントが受け取れる形式で返却
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
