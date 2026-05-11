export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    // 計算當月和下個月的頁面網址
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 產生近三個月的網址
    const pages = [];
    for (let i = 0; i < 3; i++) {
      let y = year;
      let m = month - i;
      if (m <= 0) { m += 12; y -= 1; }
      const yy = String(y).slice(2);
      const mm = String(m).padStart(2, '0');
      pages.push({
        url: `https://www.takaratomy.co.jp/products/tomica/new/${yy}${mm}.htm`,
        label: `${y}年${m}月`
      });
    }

    // 用 Claude 抓取並翻譯
    const prompt = `請幫我從以下 Tomica 官方網站抓取新品資訊並翻譯成繁體中文。

網址列表：
${pages.map(p => `- ${p.label}：${p.url}`).join('\n')}

請直接去這些網址抓取內容，然後整理成 JSON 格式回傳，格式如下：
{
  "items": [
    {
      "tag": "新品/限定/聯名/情報",
      "title": "繁體中文標題",
      "desc": "繁體中文簡短描述（50字內）",
      "date": "YYYY.MM",
      "series": "系列名稱（如：一般系列/Tomica Premium/Dream Tomica等）"
    }
  ]
}

注意：
- 只回傳 JSON，不要有其他文字
- 最多回傳 10 筆最新的商品
- 如果網址無法存取，就略過
- 聯名商品（Disney、動漫等）tag 用「聯名」
- 限定商品 tag 用「限定」
- 一般新品 tag 用「新品」`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    // 取出文字內容
    const textContent = data.content
      ?.filter(b => b.type === 'text')
      ?.map(b => b.text)
      ?.join('') || '';

    // 解析 JSON
    let items = [];
    try {
      const clean = textContent.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      items = parsed.items || [];
    } catch (e) {
      // 如果解析失敗，回傳空陣列
      items = [];
    }

    return new Response(JSON.stringify({ items, updatedAt: Date.now() }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=3600', // 快取 1 小時
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, items: [] }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
