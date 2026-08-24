import { generateCheckMacValue, getEcpayConfig, PLAN_PRICES, PLAN_TIER } from './_ecpay.js';
import { getFirestoreDb, verifyUid } from './_firebase.js';
import { computeDiscountedAmount, validatePromoDoc } from './_promo.js';

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
    const { uid, plan, promoCode } = req.body || {};
    const planInfo = PLAN_PRICES[plan];
    if (!uid || !planInfo) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    // uid 一定要跟呼叫者身份驗證後的結果一致，不能只信前端傳來的字串，
    // 不然任何人都能拿別人的 uid 建立訂單、把付款結果導去別人的帳號
    const verifiedUid = await verifyUid(req);
    if (!verifiedUid || verifiedUid !== uid) {
      return res.status(401).json({ error: '請先登入' });
    }

    const db = getFirestoreDb();

    // 已經擁有這個方案（或更高階的）就不能再花錢買一次，避免使用者
    // 誤觸或被繞過前端的按鈕限制而重複付款/買到更低階的方案
    const userSnap = await db.collection('users').doc(uid).get();
    const currentPlan = userSnap.exists ? (userSnap.data().plan || 'free') : 'free';
    if ((PLAN_TIER[currentPlan] ?? 0) >= PLAN_TIER[plan]) {
      return res.status(400).json({ error: '你已經擁有這個方案（或更高階的方案）了' });
    }

    // 折扣一律以伺服器端重新驗證過的優惠碼為準，絕不相信前端傳來的折扣金額，
    // 不然任何人都能直接呼叫這支 API 亂填折扣把金額改成 1 元
    let amount = planInfo.amount;
    let appliedPromoCode = null;
    if (promoCode && promoCode.trim()) {
      const normalizedCode = promoCode.trim().toUpperCase();
      const promoSnap = await db.collection('promoCodes').doc(normalizedCode).get();
      const promo = promoSnap.exists ? promoSnap.data() : null;
      const check = validatePromoDoc(promo, plan);
      if (!check.valid) {
        return res.status(400).json({ error: check.error });
      }
      amount = computeDiscountedAmount(planInfo.amount, promo);
      appliedPromoCode = normalizedCode;
    }

    const merchantTradeNo = generateTradeNo();
    const { merchantId, hashKey, hashIV, actionUrl } = getEcpayConfig();
    const origin = `https://${req.headers.host}`;

    await db.collection('orders').doc(merchantTradeNo).set({
      uid,
      plan,
      amount,
      originalAmount: planInfo.amount,
      promoCode: appliedPromoCode,
      status: 'pending',
      createdAt: Date.now(),
    });

    const params = {
      MerchantID: merchantId,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: formatTradeDate(new Date()),
      PaymentType: 'aio',
      TotalAmount: String(amount),
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
