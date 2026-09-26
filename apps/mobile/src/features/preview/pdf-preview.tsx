import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { usePreview } from './provider';
import { Icon } from './ui';
export function PdfPreview({ title, issuer }: { title: string; issuer: string }) {
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
        <View className="mt-md h-12 rounded-md border border-border" />
        <Text className="text-xs text-muted-foreground">
          {t('SAMPLE DOCUMENT', 'BEISPIELDOKUMENT')}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">
        {t('Visual preview · not an actual PDF', 'Visuelle Vorschau · keine echte PDF-Datei')}
      </Text>
    </View>
  );
}
