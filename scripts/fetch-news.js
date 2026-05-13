#!/usr/bin/env node

/**
 * TomicaGo 新聞自動更新腳本
 * 每月自動抓取 Takaratomy 官網最新資訊並翻譯成中文
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// 抓取網頁內容
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// 從 HTML 提取圖片網址
function extractImages(html, monthCode) {
  const base = `https://www.takaratomy.co.jp/products/tomica/new/images/${monthCode}/`;
  const imgRegex = /src="(https:\/\/www\.takaratomy\.co\.jp\/products\/tomica\/new\/images\/\d{4}\/[^"]+\.webp)"/g;
  const images = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    // 只取每個商品的第一張圖（_01.webp）
    if (match[1].includes('_01.webp')) {
      images.push(match[1]);
    }
  }
  return [...new Set(images)]; // 去重
}

// 簡單清理 HTML
function cleanHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000);
}

// 呼叫 Claude API 翻譯
function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.content?.[0]?.text || '');
        } catch(e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 產生當月和上個月的月份代碼
function getMonthCodes() {
  const now = new Date();
  const codes = [];

  // 抓最近3個月
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    codes.push({
      code: `${yy}${mm}`,
      label: `${d.getFullYear()}年${d.getMonth() + 1}月`,
      dateStr: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
    });
  }

  return codes;
}

async function main() {
  console.log('🚗 TomicaGo 新聞更新開始...');

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ 缺少 ANTHROPIC_API_KEY');
    process.exit(1);
  }

  const monthCodes = getMonthCodes();
  console.log(`📅 抓取月份: ${monthCodes.map(m => m.label).join(', ')}`);

  let allItems = [];

  for (const month of monthCodes) {
    const url = `https://www.takaratomy.co.jp/products/tomica/new/${month.code}.htm`;
    console.log(`\n📥 抓取 ${month.label}: ${url}`);

    try {
      const html = await fetchUrl(url);

      if (html.includes('404') || html.length < 1000) {
        console.log(`⚠️ ${month.label} 頁面不存在，跳過`);
        continue;
      }

      // 提取圖片網址
      const images = extractImages(html, month.code);
      console.log(`🖼️  找到 ${images.length} 張圖片`);

      // 清理 HTML 送給 Claude
      const cleanText = cleanHtml(html);

      const prompt = `以下是 Tomica ${month.label}新品頁面的日文內容，以及對應的圖片網址列表。

請整理成 JSON 格式（只回傳 JSON，不要其他文字）：

圖片網址列表：
${images.join('\n')}

頁面內容：
${cleanText}

請輸出以下格式的 JSON：
{
  "items": [
    {
      "tag": "新品或限定或聯名",
      "title": "繁體中文商品名稱",
      "desc": "繁體中文簡短說明（50字以內，包含功能特色和價格）",
      "date": "${month.dateStr}",
      "series": "系列名稱（如一般系列、Tomica Premium、Dream Tomica等）",
      "image": "對應此商品的圖片網址（從上方圖片列表中選最符合的）"
    }
  ]
}

規則：
- 每月最多15筆，選最重要的
- Disney/動漫/角色聯名 → tag用「聯名」
- 限定/紀念版/特定店鋪限定 → tag用「限定」  
- 一般新車款 → tag用「新品」
- image 必須從上方圖片列表中選，沒有對應的就用 null
- 只回傳 JSON，不要 markdown 格式`;

      console.log('🤖 呼叫 Claude 翻譯...');
      const response = await callClaude(prompt);

      try {
        const clean = response.replace(/```json\n?|```\n?/g, '').trim();
        const parsed = JSON.parse(clean);
        if (parsed.items && Array.isArray(parsed.items)) {
          allItems = allItems.concat(parsed.items);
          console.log(`✅ ${month.label} 完成，${parsed.items.length} 筆`);
        }
      } catch(e) {
        console.error(`❌ JSON 解析失敗: ${e.message}`);
        console.error('回傳內容:', response.slice(0, 200));
      }

      // 避免請求太快
      await new Promise(r => setTimeout(r, 2000));

    } catch(e) {
      console.error(`❌ 抓取 ${month.label} 失敗: ${e.message}`);
    }
  }

  console.log(`\n📊 總共 ${allItems.length} 筆資料`);

  // 產生新的 api/news.js
  const output = `export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const allItems = ${JSON.stringify(allItems, null, 2)};

  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.status(200).json({ items: allItems, updatedAt: ${Date.now()} });
}
`;

  const outputPath = path.join(__dirname, '..', 'api', 'news.js');
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`\n✅ 已更新 api/news.js`);
  console.log('🎉 完成！');
}

main().catch(err => {
  console.error('❌ 執行失敗:', err);
  process.exit(1);
});
