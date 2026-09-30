import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { localFileService, type LocalFileRecord } from './local-file-service';

export async function importPdf(): Promise<LocalFileRecord | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return localFileService.import({
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/pdf',
    size: asset.size,
  });
}

async function importImageResult(result: ImagePicker.ImagePickerResult) {
  if (result.canceled) return null;
  const asset = result.assets[0];
  return localFileService.import({
    uri: asset.uri,
    name: asset.fileName ?? undefined,
    mimeType: asset.mimeType ?? 'image/jpeg',
    size: asset.fileSize,
  });
}

export async function importImage(): Promise<LocalFileRecord | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
  });
  return importImageResult(result);
}

export async function takePhoto(): Promise<LocalFileRecord | null> {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
  });
  return importImageResult(result);
}
