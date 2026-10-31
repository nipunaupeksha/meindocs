import Ionicons from '@expo/vector-icons/Ionicons';
import { builtInSmartViews, type SavedSearch } from '@meindocs/domain';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { searchLocalDocuments } from '@/features/preview/local-search';
import { usePreview } from '@/features/preview/provider';

function countFor(view: SavedSearch, documents: ReturnType<typeof usePreview>['documents']) {
  const filters = view.filters;
  return searchLocalDocuments(
    documents,
    '',
    {
      category: filters.domain,
      needsAttention: filters.needsAttention,
      type: filters.type,
      personId: filters.personId,
      organisationId: filters.organisationId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      taxRelevant: filters.taxRelevant,
      taxYear: filters.taxYear,
      actionRequired: filters.actionRequired,
      unpaidBill: filters.unpaidBill,
      expiryStatus: filters.expiryStatus,
      tags: filters.tags,
      caseId: filters.caseId,
      expiryFrom: filters.expiryFrom,
      expiryTo: filters.expiryTo,
      customFields: filters.customFields,
    },
    view.sort,
  ).length;
}

export function SmartViewsSection() {
  const { t, smartViews, documents } = usePreview();
  const builtIns = builtInSmartViews(2026);
  const custom = smartViews.filter((view) => !builtIns.some((item) => item.id === view.id));
  return (
    <View className="gap-sm">
      <SectionHeader title={t('Smart Views', 'Smart Views')} />
      {smartViews.map((view) => (
        <Card key={view.id} className="flex-row items-center gap-sm">
          <Ionicons name={view.icon as never} size={22} color="#174A45" />
          <View className="flex-1">
            <Text className="font-manrope-semibold">{view.name}</Text>
            <Text className="text-xs text-muted-foreground">
              {countFor(view, documents)} {t('documents', 'Dokumente')}
            </Text>
          </View>
          <Button
            variant="outline"
            className="gap-sm rounded-full border-primary bg-transparent px-md"
            onPress={() => router.push({ pathname: '/smart-view', params: { id: view.id } })}
          >
            <Text className="text-sm text-primary">{t('Open', 'Öffnen')}</Text>
            <Ionicons name="arrow-up-outline" size={14} color="#174A45" style={{ transform: [{ rotate: '45deg' }] }} />
          </Button>
        </Card>
      ))}
      {!custom.length && (
        <Text className="text-xs text-muted-foreground">
          {t(
            'Create your own view for repeated workflows.',
            'Erstelle eine eigene Ansicht für wiederkehrende Abläufe.',
          )}
        </Text>
      )}
      <Button
        variant="outline"
        className="gap-sm rounded-full border-primary bg-transparent px-md"
        onPress={() => router.push('/smart-view')}
      >
        <Ionicons name="add-outline" size={14} color="#174A45" />
        <Text className="text-sm text-primary">{t('Create Smart View', 'Smart View erstellen')}</Text>
      </Button>
    </View>
  );
}
