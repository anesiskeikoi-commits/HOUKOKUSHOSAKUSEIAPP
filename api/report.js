// api/report.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POSTメソッドのみ許可されています' });
  }

  try {
    // 1. 受付(HTML)から送られてきた「報告書のメモ」を受け取る
    const { memo } = req.body;

    // 2. 金庫(環境変数)からAPIキーを取り出す
    const apiKey = process.env.GEMINI_API_KEY;

    // 3. Geminiに「報告書を作って」とお願いする
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `以下のメモをもとに、丁寧な業務報告書を作成してください。\n\nメモ：${memo}` }]
        }]
      })
    });

    const data = await response.json();

    // 4. 完成した報告書を受付(HTML)に返す
    const resultText = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ result: resultText });

  } catch (error) {
    return res.status(500).json({ error: 'エラーが発生しました' });
  }
}
