#!/usr/bin/env node

/**
 * TomicaGo 新聞自動更新腳本 v3
 * 直接解析 Takara Tomy 官網新品頁面的 HTML（不依賴任何付費 API）
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 官網常會提前公布未來月份的新品（例如6月底就會放8月的資訊），
// 所以查詢範圍除了當月，還要往後看2個月；往前留1個月當安全網，
// 避免某次執行失敗或官網資料晚公布而漏掉。
const MONTH_OFFSET_START = -1; // 上個月
const MONTH_OFFSET_END = 2;    // 未來2個月

function getMonthInfo() {
  const now = new Date();
  const months = [];
  for (let i = MONTH_OFFSET_START; i <= MONTH_OFFSET_END; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
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

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 400) {
        res.resume();
        resolve(null); // 該月份頁面尚未公布（404），略過即可
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(null));
  });
}

function stripTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&copy;/g, '©')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 依系列名稱／內文粗略判斷分類標籤（官網本身沒有明確的標籤欄位）
function guessTag(seriesName, text) {
  if (/限定|オリジナル|販売店/.test(seriesName) || /限定/.test(text)) return '限定';
  if (/ドリーム|ディズニー|チューンズ|ジョブレイバー|トーマス|ブロック|コラボ/.test(seriesName)) return '聯名';
  return '新品';
}

function parseMonthHtml(html, month) {
  const items = [];
  // 依 <h2 class="series-titles"> 切分出各系列區塊
  const sections = html.split(/<h2 class="series-titles">/).slice(1);

  for (const section of sections) {
    const seriesMatch = section.match(/^([\s\S]*?)<\/h2>/);
    const seriesName = seriesMatch ? stripTags(seriesMatch[1]) : '';

    // 每個商品都是一個 <div class="category_tomica">...</div> 區塊，
    // 用這個標記切分即可取出各商品各自的內容（不會跨到下一個商品）
    const blocks = section.split(/<div class="category_tomica"/).slice(1);

    for (const block of blocks) {
      const nameMatch = block.match(/class="CarName"[^>]*>([\s\S]*?)<\/(?:h3|p)>/);
      if (!nameMatch) continue;
      const title = stripTags(nameMatch[1]);
      if (!title) continue;

      const priceMatch = block.match(/class="CarPrice"[^>]*>([\s\S]*?)<\/p>/);
      const priceText = priceMatch ? stripTags(priceMatch[1]) : '';

      const imgMatch = block.match(/<img[^>]+src="([^"]+)"/);
      let image = null;
      if (imgMatch) {
        try { image = new URL(imgMatch[1], month.url).href; } catch (e) { image = null; }
      }

      const actionMatch = block.match(/class="mark-action"[^>]*>([\s\S]*?)<\/p>/);
      const pointMatch = block.match(/class="mark-point"[^>]*>([\s\S]*?)<\/(?:p|div)>/);
      const featureText = stripTags(actionMatch ? actionMatch[1] : (pointMatch ? pointMatch[1] : '')).slice(0, 60);

      const priceNumMatch = priceText.match(/([\d,]+)\s*円/);
      const priceStr = priceNumMatch ? `${priceNumMatch[1]}円` : '';
      const desc = [featureText, priceStr].filter(Boolean).join('。') + (featureText || priceStr ? '。' : '');

      const dateMatch = priceText.match(/(\d{4})年(\d{1,2})月/);
      const date = dateMatch ? `${dateMatch[1]}.${dateMatch[2].padStart(2, '0')}` : month.dateStr;

      // 官網「購入する」按鈕會直接連到這個商品在 Takara Tomy Mall 的
      // 購買頁（<a ... class="mallLink">，href 在真實頁面裡出現在 class
      // 前面，用 [^>]* 讓比對不管屬性順序都抓得到），有找到就存起來給
      // App 用；販售店限定款沒有這個按鈕，buyUrl 會是 null，前端會退回
      // 顯示通用購買地點資訊
      const buyLinkTag = block.match(/<a[^>]*class="mallLink"[^>]*>/);
      const buyUrl = buyLinkTag ? (buyLinkTag[0].match(/href="([^"]+)"/) || [])[1] || null : null;

      items.push({
        tag: guessTag(seriesName, title + priceText),
        title,
        desc,
        date,
        series: seriesName,
        image,
        buyUrl
      });
    }
  }

  return items;
}

async function scrapeMonth(month) {
  const html = await fetchHtml(month.url);
  if (!html) return [];
  return parseMonthHtml(html, month);
}

async function loadExistingItems(outputPath) {
  try {
    const mod = await import('file://' + outputPath + '?t=' + Date.now());
    const items = [];
    await mod.default(
      { method: 'GET' },
      {
        setHeader() {},
        status() { return this; },
        json(payload) { items.push(...(payload.items || [])); }
      }
    );
    return items;
  } catch (e) {
    console.error('讀取現有 api/news.js 失敗，視為沒有舊資料:', e.message);
    return [];
  }
}

function itemKey(item) { return `${item.date}|${item.title}`; }

// 找出「這次抓到、但之前完全沒有」的項目，用來決定要不要發推播通知
// （避免價格/描述被修正這種小更新也跳通知，只通知真正的新品）
function findNewItems(existing, freshByMonth) {
  const existingKeys = new Set(existing.map(itemKey));
  const fresh = [...freshByMonth.values()].flat();
  return fresh.filter(item => !existingKeys.has(itemKey(item)));
}

function postNotify(path, secret, body) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.tomicago.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notify-secret': secret,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${path}（HTTP ${res.statusCode}）:`, data);
        resolve();
      });
    });
    req.on('error', (e) => { console.error(`${path} 失敗:`, e.message); resolve(); });
    req.write(body);
    req.end();
  });
}

// 兩支推播各自獨立：新品通知是廣播給所有訂閱者，願望清單通知是比對每個
// 使用者自己的願望清單，任一支失敗都不影響另一支繼續執行
async function notifyNewItems(items) {
  const secret = process.env.NOTIFY_SECRET;
  if (!secret) {
    console.log('沒有設定 NOTIFY_SECRET，略過推播通知');
    return;
  }

  const body = JSON.stringify({ items: items.map(i => ({ title: i.title, tag: i.tag, date: i.date })) });
  await postNotify('/api/notify-news', secret, body);
  await postNotify('/api/notify-wishlist-matches', secret, body);
}

// 合併策略：以「月份」為單位整批取代——這次有實際抓到資料的月份，
// 用新抓到的內容整批換掉該月份的舊資料（避免新舊資料標題格式不一致時
// 誤判成兩筆不同新聞而重複顯示）；沒抓到資料的月份（可能該月頁面尚未
// 公布，或這次抓取失敗）完全不動，保留舊資料。
function mergeItems(existing, freshByMonth) {
  const preserved = existing.filter(item => !freshByMonth.has(item.date));
  const fresh = [...freshByMonth.values()].flat();
  return [...preserved, ...fresh].sort((a, b) => b.date.localeCompare(a.date));
}

async function main() {
  console.log('TomicaGo 新聞更新開始（v3，直接解析官網 HTML，無需 API）...');

  const outputPath = path.join(__dirname, '..', 'api', 'news.js');
  const existingItems = await loadExistingItems(outputPath);
  console.log('現有資料筆數:', existingItems.length);

  const months = getMonthInfo();
  console.log('查詢月份:', months.map(m => m.label).join(', '));

  const freshByMonth = new Map();
  for (const month of months) {
    const items = await scrapeMonth(month);
    console.log(`${month.label}: 抓到 ${items.length} 筆${items.length === 0 ? '（可能尚未公布，或抓取失敗，保留舊資料）' : ''}`);
    if (items.length > 0) freshByMonth.set(month.dateStr, items);
  }

  if (freshByMonth.size === 0) {
    console.error('沒有抓到任何資料，保留現有 news.js');
    process.exit(0);
  }

  const allItems = mergeItems(existingItems, freshByMonth);
  const freshCount = [...freshByMonth.values()].reduce((s, arr) => s + arr.length, 0);
  console.log(`合併後共 ${allItems.length} 筆（更新了 ${freshByMonth.size} 個月份，共 ${freshCount} 筆新資料）`);

  const newItems = findNewItems(existingItems, freshByMonth);
  console.log(`其中 ${newItems.length} 筆是全新項目（其餘是既有項目的內容更新）`);

  const output = `export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const allItems = ${JSON.stringify(allItems, null, 2)};

  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.status(200).json({ items: allItems, updatedAt: ${Date.now()} });
}
`;

  fs.writeFileSync(outputPath, output, 'utf8');
  console.log('已更新 api/news.js，完成！');

  if (newItems.length > 0) {
    await notifyNewItems(newItems);
  }
}

main().catch(err => {
  console.error('執行失敗:', err);
  process.exit(1);
});
