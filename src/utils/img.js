// Pictures hosted on Cloudinary are resized by Cloudinary itself, just by changing the link:
//   .../image/upload/c_limit,f_auto,q_auto:good,w_800/...
// - c_limit: never enlarges a small picture
// - q_auto:good: looks the same as the original at these sizes but weighs ~40% less than :best
//   (the big picture on the product page uses :best)
// - f_auto: WebP / AVIF where the browser supports it
// The parameters are always written in the same order, so every visitor asks for the SAME link and
// Cloudinary only has to create each size once (the 1st visit is the slow one, the next ones are instant).
// Any other link (for example the template pictures) is returned unchanged.
export function img(url, width, quality = 'good') {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
  const size = width ? `,w_${width}` : '';
  return url.replace('/image/upload/', `/image/upload/c_limit,f_auto,q_auto:${quality}${size}/`);
}

// Videos: the file is served exactly as uploaded. Re-encoding a video on the fly makes the first visitor
// wait (or see nothing) for a long time, so compress the video BEFORE uploading it (see the guide).
const VIDEO_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(v\d+\/.+?)(\.[a-z0-9]+)?$/i;
export function videoUrl(url) {
  return url;
}
// A small still picture of the first second, shown while the video loads
export function videoPoster(url, width = 1280) {
  const m = VIDEO_RE.exec(url || '');
  return m ? `${m[1]}c_limit,f_jpg,q_auto:good,so_0,w_${width}/${m[2]}.jpg` : undefined;
}
