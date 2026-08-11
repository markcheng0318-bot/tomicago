import { getFirestoreDb, getMessagingAdmin } from './_firebase.js';

function normalize(s) {
  return (s || '').toString().toLowerCase().replace(/[\s　・:：\-()（）,、。.!?！？"'"]/g, '');
}

// 純字串比對（願望清單是使用者自己輸入的名稱，跟官網日文原名格式常常不一樣，
// 這裡只能抓「其中一邊有包含到另一邊」這種比較直白的命中，抓不到跨語言的
// 語意相似，但不依賴外部 API，維護成本低）
function isMatch(wishlistName, newsTitle) {
  const a = normalize(wishlistName);
  const b = normalize(newsTitle);
  if (a.length < 2 || b.length < 2) return false;
  return b.includes(a) || a.includes(b);
}

function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

// 跟 notify-news.js 共用同一把 x-notify-secret，只有 GitHub Actions 的
// 新聞抓取腳本會呼叫這支 API
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-notify-secret'];
  if (!process.env.NOTIFY_SECRET || secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ usersMatched: 0, sent: 0, message: '沒有新項目' });
    }

    const db = getFirestoreDb();
    const messaging = getMessagingAdmin();

    const wishlistSnap = await db.collectionGroup('cars').where('status', '==', 'wishlist').get();

    // 依擁有者分組，同一個人可能有好幾台願望清單車，各自去比對這批新品
    const matchesByOwner = new Map(); // uid -> Set(matched titles)
    wishlistSnap.docs.forEach(d => {
      const ownerId = d.ref.parent.parent.id;
      const carName = d.data().name;
      if (!carName) return;
      for (const item of items) {
        if (isMatch(carName, item.title)) {
          if (!matchesByOwner.has(ownerId)) matchesByOwner.set(ownerId, new Set());
          matchesByOwner.get(ownerId).add(item.title);
        }
      }
    });

    let usersMatched = 0, sent = 0, failed = 0, cleaned = 0;

    for (const [uid, titleSet] of matchesByOwner) {
      const tokensSnap = await db.collection('users').doc(uid).collection('pushTokens').get();
      // 這是全新的通知類型，一定要明確開啟過才會發，不像新品通知/到期提醒
      // 那樣對舊訂閱者預設開啟
      const tokenDocs = tokensSnap.docs.filter(d => d.data().notifyWishlistMatch === true);
      if (tokenDocs.length === 0) continue;

      usersMatched++;
      const titles = [...titleSet];
      const body = titles.length === 1
        ? `你的願望清單「${truncate(titles[0], 40)}」上市了！`
        : truncate(`你的願望清單有 ${titles.length} 項上市了：${titles.slice(0, 2).map(t => truncate(t, 18)).join('、')}${titles.length > 2 ? ' 等' : ''}`, 70);

      const tokens = tokenDocs.map(d => d.id);
      const response = await messaging.sendEachForMulticast({
        notification: { title: 'TomicaGo 願望清單通知', body },
        data: { url: '/' },
        tokens,
      });
      sent += response.successCount;
      failed += response.failureCount;

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
        cleaned += invalidTokenIds.length;
      }
    }

    return res.status(200).json({ usersMatched, sent, failed, cleaned });
  } catch (e) {
    console.error('notify-wishlist-matches error:', e);
    return res.status(500).json({ error: e.message });
  }
}
