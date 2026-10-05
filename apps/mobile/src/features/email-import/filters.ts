const supported = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/heic']);
export function isSupportedEmailAttachment(mimeType: string, filename: string) {
  return supported.has(mimeType.toLowerCase()) || /\.(pdf|jpe?g|png|heic)$/i.test(filename);
}
