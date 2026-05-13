#!/usr/bin/env node

/**
 * TomicaGo 新聞自動更新腳本 v2
 * 使用 Claude web_search 工具查詢最新 Tomica 資訊
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function callClaudeWithSearch(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
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
          const text = (parsed.content || [])
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('');
          resolve(text);
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

function getMonthInfo() {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push({
      code: `${yy}${mm}`,
      label: `${d.getFullYear()}年${d.getMonth() + 1}月`,
      dateStr: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`,
      url: `https://www.takaratomy.co.jp/products/tomica/new/${yy}${mm}.htm`
    });
  }
  return months;
}

async function main() {
  console.log('TomicaGo 新聞更新開始（v2）...');

  if (!ANTHROPIC_API_KEY) {
    console.error('缺少 ANTHROPIC_API_KEY');
    process.exit(1);
  }

  const months = getMonthInfo();
  console.log('查詢月份:', months.map(m => m.label).join(', '));

  const prompt = `請幫我查詢以下 Tomica 官方網站的最新新品資訊，並整理成繁體中文 JSON。

需要查詢的網址：
${months.map(m => `- ${m.label}: ${m.url}`).join('\n')}

請用 web_search 工具查詢每個月份頁面，找出所有新品，特別注意每個商品的圖片網址（格式：https://www.takaratomy.co.jp/products/tomica/new/images/YYMM/pic_xxx_01.webp）

請整理成以下 JSON 格式（只回傳 JSON，不要其他文字）：
{"items":[{"tag":"新品或限定或聯名","title":"繁體中文商品名稱","desc":"繁體中文說明50字以內含價格","date":"YYYY.MM","series":"系列名稱","image":"完整圖片網址或null"}]}

規則：每月最多10筆。Disney/動漫聯名→tag用聯名。限定款→tag用限定。一般新車→tag用新品。圖片網址不確定就用null。只輸出JSON不要markdown。`;

  console.log('呼叫 Claude 搜尋...');
  let allItems = [];

  try {
    const response = await callClaudeWithSearch(prompt);
    console.log('Claude 回傳長度:', response.length);

    const jsonMatch = response.match(/\{[\s\S]*"items"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      allItems = parsed.items || [];
      console.log('成功解析', allItems.length, '筆資料');
    } else {
      console.error('找不到 JSON，回傳內容前500字：');
      console.error(response.slice(0, 500));
    }
  } catch(e) {
    console.error('執行失敗:', e.message);
  }

  if (allItems.length === 0) {
    console.error('沒有抓到資料，保留現有 news.js');
    process.exit(0);
  }

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
  console.log('已更新 api/news.js，完成！');
}

main().catch(err => {
  console.error('執行失敗:', err);
  process.exit(1);
});
