// 優惠碼折扣計算跟合法性判斷，validate-promo.js（即時預覽用）跟
// checkout-create.js（真正下單時的權威判斷）共用同一套邏輯，避免兩邊
// 邏輯兜不起來造成「預覽看到的折扣」跟「實際扣款金額」不一致。

export function computeDiscountedAmount(originalAmount, promo) {
  const amount = promo.type === 'percent'
    ? originalAmount * (1 - promo.value / 100)
    : originalAmount - promo.value;
  return Math.max(1, Math.round(amount));
}

export function validatePromoDoc(promo, plan) {
  if (!promo) return { valid: false, error: '優惠碼不存在' };
  if (promo.active === false) return { valid: false, error: '此優惠碼已停用' };
  if (promo.expiresAt && promo.expiresAt < Date.now()) return { valid: false, error: '優惠碼已過期' };
  if (plan && promo.applicablePlans && !promo.applicablePlans.includes(plan)) {
    return { valid: false, error: '此優惠碼不適用於所選方案' };
  }
  if (promo.maxUses != null && (promo.usedCount || 0) >= promo.maxUses) {
    return { valid: false, error: '此優惠碼已達使用上限' };
  }
  return { valid: true };
}
