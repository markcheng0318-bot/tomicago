import { getFirestoreDb, increment } from './_firebase.js';

// 推廣連結（?ref=CODE）的點擊次數，純粹是分析用的計數，不影響任何
// 金流或權限判斷，所以不需要登入就能記錄
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { code } = req.body || {};
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: '缺少代碼' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const db = getFirestoreDb();
    const ref = db.collection('promoCodes').doc(normalizedCode);
    const snap = await ref.get();
    // 代碼不存在就不記錄，避免亂打的字串在資料庫裡堆出一堆垃圾文件
    if (!snap.exists) {
      return res.status(200).json({ tracked: false });
    }

    await ref.update({ clickCount: increment(1) });
    return res.status(200).json({ tracked: true });
  } catch (e) {
    console.error('track-click error:', e);
    return res.status(500).json({ error: e.message });
  }
}
