export function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}
