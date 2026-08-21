import { getFirestoreDb } from './_firebase.js';
import { validatePromoDoc } from './_promo.js';

// 只是「這組優惠碼合不合法」的即時預覽，不消耗使用次數（真正下單、
// 付款成功後才會由 checkout-notify.js 真正把 usedCount +1），
// 所以這支不需要登入也能查
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ valid: false, error: 'Method not allowed' });

  try {
    const { code, plan } = req.body || {};
    if (!code || !code.trim()) {
      return res.status(200).json({ valid: false, error: '請輸入優惠碼' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const db = getFirestoreDb();
    const snap = await db.collection('promoCodes').doc(normalizedCode).get();
    const promo = snap.exists ? snap.data() : null;

    const check = validatePromoDoc(promo, plan);
    if (!check.valid) {
      return res.status(200).json({ valid: false, error: check.error });
    }

    return res.status(200).json({
      valid: true,
      type: promo.type,
      value: promo.value,
      applicablePlans: promo.applicablePlans || null,
    });
  } catch (e) {
    console.error('validate-promo error:', e);
    return res.status(500).json({ valid: false, error: e.message });
  }
}
