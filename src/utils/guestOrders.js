const KEY = 'ts-mode-guest-orders';

export function getGuestOrders() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function saveGuestOrder({ orderNumber, phone }) {
  if (!orderNumber) return;
  const rest = getGuestOrders().filter((o) => o.orderNumber !== orderNumber);
  localStorage.setItem(KEY, JSON.stringify([{ orderNumber, phone }, ...rest].slice(0, 20)));
}
