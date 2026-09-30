import { Image, Linking, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { usePreview } from './provider';
import { Icon } from './ui';
export function PdfPreview({
  title,
  issuer,
  thumbnailUri,
  localUri,
}: {
  title: string;
  issuer: string;
  thumbnailUri?: string;
  localUri?: string;
}) {
  const { t } = usePreview();
  return (
    <View className="items-center gap-sm rounded-lg bg-primary-soft p-lg">
      <View className="w-full gap-md rounded-md bg-white p-lg">
        <View className="flex-row items-center justify-between">
          <Icon name="document-text-outline" />
          <Text className="font-manrope-semibold text-xs text-muted-foreground">PDF</Text>
        </View>
        <Text className="font-manrope-bold text-xl">{issuer}</Text>
        <Text className="font-manrope-semibold">{title}</Text>
        {[100, 85, 95, 65].map((width) => (
          <View key={width} style={{ width: `${width}%` }} className="h-1 rounded-full bg-border" />
        ))}
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            className="mt-md h-40 rounded-md"
            resizeMode="contain"
          />
        ) : (
          <View className="mt-md h-12 rounded-md border border-border" />
        )}
        <Text className="text-xs text-muted-foreground">
          {thumbnailUri
            ? t('LOCAL THUMBNAIL', 'LOKALES VORSCHAUBILD')
            : t('SAMPLE DOCUMENT', 'BEISPIELDOKUMENT')}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">
        {t('Visual preview · not an actual PDF', 'Visuelle Vorschau · keine echte PDF-Datei')}
      </Text>
      {localUri && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Open stored file', 'Gespeicherte Datei öffnen')}
          onPress={() => void Linking.openURL(localUri)}
          className="min-h-12 justify-center"
        >
          <Text className="font-manrope-medium text-primary">
            {t('Open stored file', 'Gespeicherte Datei öffnen')} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}
