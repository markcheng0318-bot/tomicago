import { getFirestoreDb, getMessagingAdmin } from './_firebase.js';

const PLAN_LABELS = { standard: '標準版', pro: '進階版' };
const REMIND_THRESHOLDS = [30, 10, 0];
const DAY_MS = 24 * 60 * 60 * 1000;

// 用 UTC 日期整數相減，不用毫秒差直接除，避免同一天內因為 cron 執行時間
// 跟方案到期的時分秒對不齊，導致算出 29 或 31 天而漏推播
function daysUntil(expiryMs, nowMs) {
  return Math.floor(expiryMs / DAY_MS) - Math.floor(nowMs / DAY_MS);
}

function buildMessage(planLabel, daysLeft, expiryMs) {
  const dateStr = new Date(expiryMs).toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' });
  if (daysLeft === 0) {
    return `你的 TomicaGo ${planLabel}今天到期，若未續訂將自動降為免費方案`;
  }
  return `你的 TomicaGo ${planLabel}還有 ${daysLeft} 天到期（${dateStr}），記得續訂喔！`;
}

// 這支 API 只給 Vercel Cron 自己觸發，透過 CRON_SECRET 驗證來源，
// 避免任何人都能打這支 API 對使用者亂發推播
export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = getFirestoreDb();
    const messaging = getMessagingAdmin();
    const now = Date.now();

    const usersSnap = await db.collection('users').where('plan', 'in', ['standard', 'pro']).get();

    let checked = 0, sent = 0, failed = 0, cleaned = 0;

    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data();
      if (!data.planExpiry) continue;
      checked++;

      const daysLeft = daysUntil(data.planExpiry, now);
      if (!REMIND_THRESHOLDS.includes(daysLeft)) continue;

      // 同一個到期週期（同一個 planExpiry）裡，每個門檻只發一次；
      // 續訂後 planExpiry 會換新值，reminders 也會跟著重置（見 checkout-notify.js）
      const reminders = data.planReminders || {};
      const alreadySent = reminders.forExpiry === data.planExpiry && (reminders.sent || []).includes(daysLeft);
      if (alreadySent) continue;

      const tokensSnap = await userDoc.ref.collection('pushTokens').get();
      // notifyPlanExpiry 欄位是後來才加的，舊的訂閱者（本來就有開新品通知）
      // 這個欄位是 undefined，預設當作有開啟，只有明確設成 false 才排除
      const expiryTokenDocs = tokensSnap.docs.filter(d => d.data().notifyPlanExpiry !== false);
      if (expiryTokenDocs.length > 0) {
        const tokens = expiryTokenDocs.map(d => d.id);
        const planLabel = PLAN_LABELS[data.plan] || data.plan;
        const body = buildMessage(planLabel, daysLeft, data.planExpiry);

        const response = await messaging.sendEachForMulticast({
          notification: { title: 'TomicaGo 方案到期提醒', body },
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

      const newSent = reminders.forExpiry === data.planExpiry ? [...(reminders.sent || []), daysLeft] : [daysLeft];
      await userDoc.ref.update({ planReminders: { forExpiry: data.planExpiry, sent: newSent } });
    }

    return res.status(200).json({ checked, sent, failed, cleaned });
  } catch (e) {
    console.error('cron-plan-expiry error:', e);
    return res.status(500).json({ error: e.message });
  }
}
