import admin from 'firebase-admin';
import { generateCheckMacValue, getEcpayConfig } from './_ecpay.js';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}
const db = admin.firestore();

// 綠界的付款結果通知（Server 對 Server），一定要驗證 CheckMacValue，
// 否則任何人都能直接對這支 API POST 假的「付款成功」訊息來偷升級方案。
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('0|MethodNotAllowed');

  try {
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
