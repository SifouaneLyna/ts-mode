// Sends shopping events to the Meta Pixel and the TikTok Pixel (does nothing if one is blocked or missing)
const TIKTOK_NAMES = {
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
};

const tiktokData = (d = {}) => ({
  content_type: "product",
  contents: (d.content_ids || []).map((id) => ({
    content_id: String(id),
    content_type: "product",
    content_name: d.content_name,
  })),
  value: d.value,
  currency: d.currency,
});

export function track(event, data) {
  if (typeof window === "undefined") return;
  if (window.fbq) window.fbq("track", event, data);
  if (window.ttq && TIKTOK_NAMES[event])
    window.ttq.track(TIKTOK_NAMES[event], tiktokData(data));
}
