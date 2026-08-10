import { generateCheckMacValue, getEcpayConfig } from './_ecpay.js';
import { getFirestoreDb } from './_firebase.js';

// 綠界的付款結果通知（Server 對 Server），一定要驗證 CheckMacValue，
// 否則任何人都能直接對這支 API POST 假的「付款成功」訊息來偷升級方案。
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('0|MethodNotAllowed');

  try {
    const db = getFirestoreDb();
    const data = req.body || {};
    const { hashKey, hashIV } = getEcpayConfig();

    const receivedMac = data.CheckMacValue;
    const expectedMac = generateCheckMacValue(data, hashKey, hashIV);

    if (!receivedMac || receivedMac !== expectedMac) {
      console.error('ECPay notify: CheckMacValue 不符，拒絕處理', data.MerchantTradeNo);
      return res.status(200).send('0|CheckMacValueError');
    }

    const orderRef = db.collection('orders').doc(data.MerchantTradeNo);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      console.error('ECPay notify: 找不到對應訂單', data.MerchantTradeNo);
      return res.status(200).send('0|OrderNotFound');
    }
    const order = orderSnap.data();

    // 已經處理過就直接回覆成功（綠界可能會重送同一筆通知）
    if (order.status === 'paid') {
      return res.status(200).send('1|OK');
    }

    if (data.RtnCode === '1') {
      const planExpiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
      await db.collection('users').doc(order.uid).update({
        plan: order.plan,
        planExpiry,
        // 換了新的到期日，到期提醒（30/10/0天前）要跟著重新起算，
        // 不然這次到期不會再收到提醒（因為 forExpiry 對不上新值才會重發，
        // 但這裡直接清空最保險，不用等下次 cron 自己判斷）
        planReminders: { forExpiry: planExpiry, sent: [] },
      });
      await orderRef.update({
        status: 'paid',
        paidAt: Date.now(),
        rtnMsg: data.RtnMsg || '',
      });
    } else {
      await orderRef.update({
        status: 'failed',
        rtnMsg: data.RtnMsg || '',
      });
    }

    return res.status(200).send('1|OK');
  } catch (e) {
    console.error('checkout-notify error:', e);
    return res.status(200).send('0|ServerError');
  }
}
