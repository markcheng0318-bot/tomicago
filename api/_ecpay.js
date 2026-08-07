import crypto from 'crypto';

// 綠界官方公開的測試環境介接資訊（非機密，僅供開發測試用）
// 正式環境請在 Vercel 環境變數設定 ECPAY_MERCHANT_ID / ECPAY_HASH_KEY / ECPAY_HASH_IV / ECPAY_ACTION_URL
const SANDBOX = {
  merchantId: '2000132',
  hashKey: '5294y06JbISpM5x9',
  hashIV: 'v77hoKGq4kWxNNIS',
  actionUrl: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
};

export function getEcpayConfig() {
  return {
    merchantId: process.env.ECPAY_MERCHANT_ID || SANDBOX.merchantId,
    hashKey: process.env.ECPAY_HASH_KEY || SANDBOX.hashKey,
    hashIV: process.env.ECPAY_HASH_IV || SANDBOX.hashIV,
    actionUrl: process.env.ECPAY_ACTION_URL || SANDBOX.actionUrl,
  };
}

// 綠界的檢查碼要求用 .NET 風格的 URL encode：空白編成 +，且大部分符號維持原樣。
// JS 的 encodeURIComponent 已經和這個規則幾乎一致，唯一差異是單引號──
// .NET 會把它編成 %27，但 encodeURIComponent 不會動它，所以要手動補上。
// （這組轉換規則是跟綠界官方 Python SDK 原始碼逐行核對過的，不是憑印象亂猜。）
function ecpayUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/'/g, '%27');
}

// 計算檢查碼 CheckMacValue，演算法規則：
// 1. 依欄位名稱（不分大小寫）排序
// 2. 串接成 HashKey=xxx&Key1=Val1&Key2=Val2&...&HashIV=yyy
// 3. 對整串字串做 URL encode 後轉小寫
// 4. SHA256 雜湊後轉大寫
export function generateCheckMacValue(params, hashKey, hashIV) {
  const keys = Object.keys(params)
    .filter(k => k !== 'CheckMacValue')
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const paramStr = keys.map(k => `${k}=${params[k]}`).join('&');
  const raw = `HashKey=${hashKey}&${paramStr}&HashIV=${hashIV}`;
  const encoded = ecpayUrlEncode(raw).toLowerCase();

  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();
}

export const PLAN_PRICES = {
  standard: { amount: 300, label: 'TomicaGo 標準版年費訂閱', limitDays: 365 },
  pro: { amount: 500, label: 'TomicaGo 進階版年費訂閱', limitDays: 365 },
};

// 方案等級，用來判斷「使用者是不是想花錢買一個已經擁有、或更低階的方案」
export const PLAN_TIER = { free: 0, standard: 1, pro: 2 };
