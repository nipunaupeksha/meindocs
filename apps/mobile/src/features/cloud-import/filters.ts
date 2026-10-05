import type { CloudFile } from './types';
const supportedExtensions = /\.(pdf|jpe?g|png|heic)$/i;
export function isSupportedCloudDocument(file: Pick<CloudFile, 'name' | 'mimeType' | 'isFolder'>) {
  return (
    !file.isFolder &&
    file.mimeType !== 'application/vnd.google-apps.folder' &&
    supportedExtensions.test(file.name)
  );
}
