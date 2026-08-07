import { generateCheckMacValue, getEcpayConfig, PLAN_PRICES, PLAN_TIER } from './_ecpay.js';
import { getFirestoreDb } from './_firebase.js';

function pad(n) { return String(n).padStart(2, '0'); }

function formatTradeDate(d) {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function generateTradeNo() {
  return 'TG' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { uid, plan } = req.body || {};
    const planInfo = PLAN_PRICES[plan];
    if (!uid || !planInfo) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const db = getFirestoreDb();

    // 已經擁有這個方案（或更高階的）就不能再花錢買一次，避免使用者
    // 誤觸或被繞過前端的按鈕限制而重複付款/買到更低階的方案
    const userSnap = await db.collection('users').doc(uid).get();
    const currentPlan = userSnap.exists ? (userSnap.data().plan || 'free') : 'free';
    if ((PLAN_TIER[currentPlan] ?? 0) >= PLAN_TIER[plan]) {
      return res.status(400).json({ error: '你已經擁有這個方案（或更高階的方案）了' });
    }

    const merchantTradeNo = generateTradeNo();
    const { merchantId, hashKey, hashIV, actionUrl } = getEcpayConfig();
    const origin = `https://${req.headers.host}`;

    await db.collection('orders').doc(merchantTradeNo).set({
      uid,
      plan,
      amount: planInfo.amount,
      status: 'pending',
      createdAt: Date.now(),
    });

    const params = {
      MerchantID: merchantId,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: formatTradeDate(new Date()),
      PaymentType: 'aio',
      TotalAmount: String(planInfo.amount),
      TradeDesc: 'TomicaGo 方案升級',
      ItemName: planInfo.label,
      ReturnURL: `${origin}/api/checkout-notify`,
      ClientBackURL: `${origin}/?checkout=done`,
      ChoosePayment: 'ALL',
      EncryptType: '1',
    };
    params.CheckMacValue = generateCheckMacValue(params, hashKey, hashIV);

    return res.status(200).json({ actionUrl, params });
  } catch (e) {
    console.error('checkout-create error:', e);
    return res.status(500).json({ error: e.message });
  }
}
