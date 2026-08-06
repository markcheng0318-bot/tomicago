import { getMessagingAdmin } from './_firebase.js';

// 開啟新品通知的當下發一則測試推播，讓使用者能馬上看到系統通知確認
// 真的有生效，不用等到下次真的有新品才知道有沒有訂閱成功。
// 這支只會發給呼叫者自己「剛拿到」的 token，不需要共用密鑰保護
// （FCM token 是不可預測的隨機字串，拿得到別人的 token 本身就代表
// 已經能存取那個帳號的資料，不會是這支 API 的攻擊面）。
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { token } = req.body || {};
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: '缺少 token' });
    }

    const messaging = getMessagingAdmin();
    await messaging.send({
      token,
      notification: {
        title: 'TomicaGo',
        body: '🔔 新品通知已開啟',
      },
      data: { url: '/' },
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('send-test-notification error:', e);
    return res.status(500).json({ error: e.message });
  }
}
