import { getFirestoreDb, verifyUid } from './_firebase.js';

// 跟 Firestore 規則、admin.html 用同一份管理員名單。orders collection
// 對任何人（含前端的 Firestore SDK）都是 allow read,write: if false，
// 就算是管理員也一樣，所以這裡才需要一支專用的伺服器端 API 用 Admin SDK
// 讀取，不讓 orders 的付款細節暴露在前端可查詢的範圍內。
const ADMIN_UIDS = ['Uq7Ok9vF3qVSYGPH3U0fnshG1ZG2'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const uid = await verifyUid(req);
    if (!uid || !ADMIN_UIDS.includes(uid)) {
      return res.status(403).json({ error: '沒有權限' });
    }

    const db = getFirestoreDb();
    // 資料量對這個規模的 App 來說不大，直接抓全部訂單在記憶體裡分組，
    // 不用另外建索引
    const ordersSnap = await db.collection('orders').get();

    const statsByCode = {};
    ordersSnap.docs.forEach(d => {
      const o = d.data();
      const code = o.promoCode;
      if (!code) return;
      if (!statsByCode[code]) statsByCode[code] = { code, totalOrders: 0, conversions: 0, revenue: 0 };
      statsByCode[code].totalOrders++;
      if (o.status === 'paid') {
        statsByCode[code].conversions++;
        statsByCode[code].revenue += (o.amount || 0);
      }
    });

    return res.status(200).json({ stats: Object.values(statsByCode) });
  } catch (e) {
    console.error('admin-partner-stats error:', e);
    return res.status(500).json({ error: e.message });
  }
}
