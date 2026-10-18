// Sends an event to the Meta Pixel (does nothing if the Pixel is blocked or missing)
export function track(event, data) {
  if (typeof window !== "undefined" && window.fbq)
    window.fbq("track", event, data);
}
