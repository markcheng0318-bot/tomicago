import { getFirestoreDb, verifyUid } from './_firebase.js';

const PLAN_LIMITS = { free: 80, standard: 800, pro: 3000 };

// 跟前端一致的邏輯：方案過期了就當作免費方案，不能用還沒被前端
// 自動降級寫回去之前的空窗期，讓使用者多塞車輛進來
function effectivePlan(data) {
  if (data.plan && data.plan !== 'free' && data.planExpiry && data.planExpiry < Date.now()) {
    return 'free';
  }
  return data.plan || 'free';
}

// 用 Firestore count() 聚合查詢直接算「已收藏」的真實數量，不依賴前端
// 快取或任何看得到、改得動的欄位，前端沒辦法偽造出比較低的數字來繞過
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const uid = await verifyUid(req);
    if (!uid) return res.status(401).json({ error: '請先登入' });

    const db = getFirestoreDb();
    const userSnap = await db.collection('users').doc(uid).get();
    const userData = userSnap.exists ? userSnap.data() : { plan: 'free' };
    const plan = effectivePlan(userData);
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    const countSnap = await db.collection('users').doc(uid).collection('cars')
      .where('status', '==', 'owned').count().get();
    const owned = countSnap.data().count;

    return res.status(200).json({ plan, owned, limit, canAdd: owned < limit });
  } catch (e) {
    console.error('check-car-limit error:', e);
    return res.status(500).json({ error: e.message });
  }
}
