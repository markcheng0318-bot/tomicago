export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 產生近兩個月的網址
    const now = new Date();
    const pages = [];
    for (let i = 0; i < 2; i++) {
      let y = now.getFullYear();
      let m = now.getMonth() + 1 - i;
      if (m <= 0) { m += 12; y -= 1; }
      const yy = String(y).slice(2);
      const mm = String(m).padStart(2, '0');
      pages.push({
        url: `https://www.takaratomy.co.jp/products/tomica/new/${yy}${mm}.htm`,
        label: `${y}年${m}月`
      });
    }

    // 抓取網頁內容
    let rawContent = '';
    for (const page of pages) {
      try {
        const r = await fetch(page.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TomicaGoBot/1.0)' },
          signal: AbortSignal.timeout(8000)
        });
        if (r.ok) {
          const html = await r.text();
          // 簡單清理 HTML，只留文字
          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .slice(0, 8000);
          rawContent += `\n=== ${page.label} (${page.url}) ===\n${text}\n`;
        }
      } catch (e) {
        rawContent += `\n=== ${page.label} ：無法存取 ===\n`;
      }
    }

    // 送給 Claude 翻譯整理
    const prompt = `以下是 Tomica 官方網站的日文新品資訊，請翻譯並整理成繁體中文 JSON。

${rawContent}

請整理成以下 JSON 格式，只回傳 JSON 不要其他文字：
{
  "items": [
    {
      "tag": "新品或限定或聯名或情報",
      "title": "繁體中文商品標題",
      "desc": "繁體中文簡短描述50字以內",
      "date": "YYYY.MM",
      "series": "系列名稱"
    }
  ]
}

規則：
- 最多10筆，優先最新的
- Disney/動漫/角色聯名 → tag用聯名
- 限定/紀念版 → tag用限定
- 一般新車 → tag用新品
- 活動資訊 → tag用情報
- 只回傳JSON`;

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const apiData = await apiRes.json();
    const text = apiData.content?.find(b => b.type === 'text')?.text || '';

    let items = [];
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      items = JSON.parse(clean).items || [];
    } catch (e) {
      items = [];
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ items, updatedAt: Date.now() });

  } catch (err) {
    return res.status(500).json({ error: err.message, items: [] });
  }
}
