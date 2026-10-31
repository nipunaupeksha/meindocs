import type { MockDocument } from '@/features/preview/data';
import { useState } from 'react';
import { RouteError } from '@/components/app/route-error';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Modal, Pressable, View } from 'react-native';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StatusBadge } from '@/components/app/status-badge';
import { colors } from '@meindocs/ui';
import { usePreview } from '@/features/preview/provider';
import { categories, formatDate, type Category } from '@/features/preview/data';
import { PdfPreview } from '@/features/preview/pdf-preview';
import { Icon, InfoRow, Options, Page } from '@/features/preview/ui';
import { readRouteId } from '@/lib/route-params';
import { CustomFieldsSection } from '@/features/custom-fields/ui';
import { DocumentSeriesSection } from '@/features/document-series/ui';
export default function DocumentDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { t, documents } = usePreview();
  const document = documents.find((item) => item.id === readRouteId(params.id));
  if (!document)
    return (
      <RouteError
        message={t(
          'Document not found in this preview.',
          'Dokument in dieser Vorschau nicht gefunden.',
        )}
      />
    );
  return <DetailContent document={document} />;
}
function DetailContent({ document }: { document: MockDocument }) {
  const { t, language, localeLanguage, updateDocument, deleteDocument, customFieldValues, saveCustomFieldValues } = usePreview();
  const [actionsOpen, setActionsOpen] = useState(false);
  return (
    <Page>
      <View className="gap-sm">
        <View className="flex-row items-start gap-sm">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Go back', 'Zurück')}
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center bg-transparent"
          >
            <Icon name="chevron-back" color={colors.primary} size={22} />
          </Pressable>
          <Text className="min-w-0 flex-1 font-manrope-bold text-2xl">{document.title[language]}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('More document actions', 'Weitere Dokumentaktionen')}
            accessibilityState={{ expanded: actionsOpen }}
            onPress={() => setActionsOpen((open) => !open)}
            className="h-9 flex-row items-center gap-xs rounded-full border border-primary px-sm"
          >
            <Icon name="ellipsis-horizontal" color={colors.primary} size={18} />
            <Text className="text-xs text-primary">{t('More', 'Mehr')}</Text>
          </Pressable>
        </View>
        <StatusBadge
          label={document.reviewed ? t('Reviewed', 'Geprüft') : t('Needs review', 'Prüfung ausstehend')}
          tone={document.reviewed ? 'success' : 'warning'}
        />
        <Modal
          visible={actionsOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setActionsOpen(false)}
        >
          <View className="flex-1 justify-end bg-black/30 p-md">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Close actions menu', 'Aktionsmenü schließen')}
              onPress={() => setActionsOpen(false)}
              className="absolute inset-0"
            />
            <Card className="gap-xs rounded-2xl p-sm">
            <MenuAction
              icon="heart-outline"
              label={document.favorite ? t('Remove from favorites', 'Aus Favoriten entfernen') : t('Add to favorites', 'Zu Favoriten hinzufügen')}
              onPress={() => { void updateDocument(document.id, { favorite: !document.favorite }); setActionsOpen(false); }}
            />
            <MenuAction
              icon="notifications-outline"
              label={t('Create a reminder', 'Erinnerung erstellen')}
              onPress={() => { setActionsOpen(false); router.push({ pathname: '/create-reminder', params: { documentId: document.id } }); }}
            />
            <MenuAction
              icon="share-outline"
              label={t('Export and share', 'Exportieren und teilen')}
              onPress={() => { setActionsOpen(false); router.push({ pathname: '/export', params: { documentId: document.id } }); }}
            />
            <MenuAction
              icon="pencil-outline"
              label={t('Edit title', 'Titel bearbeiten')}
              onPress={() => { setActionsOpen(false); router.push({ pathname: '/document/edit', params: { id: document.id } }); }}
            />
            <MenuAction
              icon="trash-outline"
              label={t('Delete document', 'Dokument löschen')}
              destructive
              onPress={() => Alert.alert(
                t('Delete document?', 'Dokument löschen?'),
                t('This document will be permanently deleted.', 'Dieses Dokument wird dauerhaft gelöscht.'),
                [
                  { text: t('Cancel', 'Abbrechen'), style: 'cancel' },
                  { text: t('Delete', 'Löschen'), style: 'destructive', onPress: () => { void deleteDocument(document.id); router.back(); } },
                ],
              )}
            />
            </Card>
          </View>
        </Modal>
      </View>
      <PdfPreview
        title={document.title[language]}
        issuer={document.issuer}
        thumbnailUri={document.thumbnailUri}
        localUri={document.localUri}
      />
      <Card className='bg-transparent py-2'>
        <InfoRow label={t('Sender', 'Absender')} value={document.issuer} showSeparator={true}/>
        <InfoRow label={t('Added', 'Hinzugefügt')} value={formatDate(document.date, localeLanguage)} showSeparator={true}/>
        <InfoRow
          label={t('File', 'Datei')}
          value={`PDF · ${document.pages} ${t('pages', 'Seiten')} · ${document.size}`}
          showSeparator={false}
        />
      </Card>
      <CustomFieldsSection
        values={customFieldValues[document.id] ?? {}}
        onAdd={() => router.push({ pathname: '/document/edit', params: { id: document.id } })}
        onEdit={() => router.push({ pathname: '/document/edit', params: { id: document.id } })}
        onDelete={(key) => {
          const next = { ...(customFieldValues[document.id] ?? {}) };
          delete next[key];
          saveCustomFieldValues(document.id, next);
        }}
      />
      <DocumentSeriesSection document={document} />
      <SectionHeader title={t('Category', 'Kategorie')} />
      <Options
        value={document.category}
        options={Object.entries(categories).map(([value, label]) => ({
          value: value as Category,
          label: label[language],
        }))}
        onChange={(category) => updateDocument(document.id, { category })}
      />
      <View className="gap-sm">
        <Button
          className="w-full"
          onPress={() => updateDocument(document.id, { reviewed: !document.reviewed })}
        >
          <Icon name={document.reviewed ? 'close-circle-outline' : 'checkmark-circle-outline'} color="white" size={18} />
          <Text className="text-xs">
            {document.reviewed
              ? t('Mark as needing review', 'Als ungeprüft markieren')
              : t('Mark as reviewed', 'Als geprüft markieren')}
          </Text>
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onPress={() => router.push({ pathname: '/generate-document', params: { documentId: document.id } })}
        >
          <Icon name="document-text-outline" color={colors.primary} size={18} />
          <Text className="text-xs text-center">{t('Generate a formal document', 'Formelles Dokument erstellen')}</Text>
        </Button>
      </View>
    </Page>
  );
}

function MenuAction({
  label,
  icon,
  onPress,
  destructive = false,
}: {
  label: string;
  icon: 'heart-outline' | 'share-outline' | 'notifications-outline' | 'pencil-outline' | 'trash-outline';
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-sm rounded-md px-sm"
    >
      <Icon name={icon} color={destructive ? colors.danger : colors.primary} size={18} />
      <Text className={destructive ? 'text-sm text-danger' : 'text-sm'}>{label}</Text>
    </Pressable>
  );
}
