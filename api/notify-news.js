import { getFirestoreDb, getMessagingAdmin } from './_firebase.js';

// 這支 API 會發送推播給「所有」訂閱新品通知的使用者，所以一定要驗證
// 呼叫來源，不然任何人都能亂打這支 API 對全部使用者洗版。
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-notify-secret'];
  if (!process.env.NOTIFY_SECRET || secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ sent: 0, message: '沒有新項目，不發送通知' });
    }

    const db = getFirestoreDb();
    const messaging = getMessagingAdmin();

    const tokensSnap = await db.collectionGroup('pushTokens').get();
    if (tokensSnap.empty) {
      return res.status(200).json({ sent: 0, message: '沒有訂閱者' });
    }
    const tokens = tokensSnap.docs.map(d => d.id);

    const title = 'TomicaGo 新品通知';
    const body = items.length === 1
      ? `${items[0].title} 上架了！`
      : `本次新增 ${items.length} 筆新品：${items.slice(0, 3).map(i => i.title).join('、')}${items.length > 3 ? '...' : ''}`;

    const response = await messaging.sendEachForMulticast({
      notification: { title, body },
      data: { url: '/' },
      tokens,
    });

    // 清掉已經失效的 token（使用者解除安裝、清除瀏覽器資料等情況）
    const invalidTokenIds = [];
    response.responses.forEach((r, i) => {
      const code = r.error?.code;
      if (!r.success && (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token')) {
        invalidTokenIds.push(tokens[i]);
      }
    });

    if (invalidTokenIds.length > 0) {
      const staleDocs = tokensSnap.docs.filter(d => invalidTokenIds.includes(d.id));
      await Promise.all(staleDocs.map(d => d.ref.delete()));
    }

    return res.status(200).json({
      sent: response.successCount,
      failed: response.failureCount,
      cleaned: invalidTokenIds.length,
    });
  } catch (e) {
    console.error('notify-news error:', e);
    return res.status(500).json({ error: e.message });
  }
}
