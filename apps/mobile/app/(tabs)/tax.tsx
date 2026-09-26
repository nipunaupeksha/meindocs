import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { money, formatDate } from '@/features/preview/data';
import { Icon, Options, Page } from '@/features/preview/ui';
export default function TaxScreen() {
  const { t, language, documents, notify } = usePreview();
  const [filter, setFilter] = useState('all');
  const receipts = documents.filter((item) => item.amount !== undefined);
  const total = receipts.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const reviewed = receipts.filter((item) => item.reviewed).length;
  return (
    <Page
      tab
      title={t('A calmer tax season.', 'Entspannter durch die Steuerzeit.')}
      subtitle={t('TAX OVERVIEW · 2026', 'STEUERÜBERSICHT · 2026')}
    >
      <Card className="gap-md border-primary bg-primary p-lg">
        <Icon name="receipt-outline" color="#D9B77E" size={30} />
        <Text className="text-sm text-white/80">
          {t('Collected expenses', 'Gesammelte Ausgaben')}
        </Text>
        <Text className="font-manrope-bold text-3xl text-white">{money(total, language)}</Text>
        <Text className="text-sm text-white/80">
          {receipts.length}{' '}
          {t(
            'receipts · sample figures, not a tax calculation',
            'Belege · Beispielwerte, keine Steuerberechnung',
          )}
        </Text>
      </Card>
      <Card>
        <View className="flex-row justify-between">
          <Text className="font-manrope-semibold">{t('Review progress', 'Prüffortschritt')}</Text>
          <Text>
            {reviewed}/{receipts.length}
          </Text>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-border">
          <View
            style={{ width: `${receipts.length ? (reviewed / receipts.length) * 100 : 0}%` }}
            className="h-2 bg-primary"
          />
        </View>
      </Card>
      <SectionHeader
        title={t('Your receipts', 'Deine Belege')}
        action={{ label: t('Add', 'Hinzufügen'), onPress: () => router.push('/add-document') }}
      />
      <Options
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('All', 'Alle') },
          { value: 'review', label: t('Needs review', 'Zu prüfen') },
        ]}
      />
      {receipts
        .filter((item) => filter === 'all' || !item.reviewed)
        .map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/receipt/[id]', params: { id: item.id } })}
          >
            <Card>
              <View className="flex-row items-center gap-sm">
                <View className="flex-1">
                  <Text className="font-manrope-semibold">{item.issuer}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {formatDate(item.date, language)}
                  </Text>
                </View>
                <Text className="font-manrope-semibold">{money(item.amount ?? 0, language)}</Text>
              </View>
              <Text className="text-sm text-muted-foreground">{item.title[language]}</Text>
              <StatusBadge
                tone={item.reviewed ? 'success' : 'warning'}
                label={item.reviewed ? t('Reviewed', 'Geprüft') : t('Needs review', 'Zu prüfen')}
              />
            </Card>
          </Pressable>
        ))}
      {filter === 'review' && reviewed === receipts.length && (
        <Text>{t('All receipts reviewed.', 'Alle Belege sind geprüft.')}</Text>
      )}
      <Button
        variant="outline"
        onPress={() =>
          notify(
            'Export preview prepared · no file created',
            'Exportvorschau vorbereitet · keine Datei erstellt',
          )
        }
      >
        <Text>{t('Preview tax export', 'Steuerexport ansehen')}</Text>
      </Button>
    </Page>
  );
}
