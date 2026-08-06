import admin from 'firebase-admin';

// 延遲初始化，缺環境變數時丟出清楚的錯誤訊息，而不是讓整支 function
// 在 module 載入階段就直接當機。
export function getFirestoreDb() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('尚未設定 FIREBASE_SERVICE_ACCOUNT 環境變數');
  }
  if (!admin.apps.length) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT 環境變數不是合法的 JSON');
    }
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  return admin.firestore();
}

export function getMessagingAdmin() {
  getFirestoreDb(); // 確保 admin app 已經初始化
  return admin.messaging();
}
