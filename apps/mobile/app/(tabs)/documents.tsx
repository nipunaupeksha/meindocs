import { useMemo, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/app/empty-state';
import { usePreview } from '@/features/preview/provider';
import { categories, type Category } from '@/features/preview/data';
import { DocumentItem, Field, Options, Page } from '@/features/preview/ui';
import {
  highlightParts,
  searchLocalDocuments,
  type LocalSearchSort,
} from '@/features/preview/local-search';
import { View } from 'react-native';
import { SmartViewsSection } from '@/features/smart-views/ui';

function Highlight({ value, query }: { value: string; query: string }) {
  return (
    <Text className="text-xs text-muted-foreground">
      {highlightParts(value, query).map((part, index) => (
        <Text
          key={`${part}-${index}`}
          className={
            query.toLocaleLowerCase().includes(part.toLocaleLowerCase())
              ? 'font-manrope-bold text-primary'
              : undefined
          }
        >
          {part}
        </Text>
      ))}
    </Text>
  );
}
export default function DocumentsScreen() {
  const { t, language, documents, people, organisations, cases, bulkUpdateDocuments } =
    usePreview();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<LocalSearchSort>('relevance');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [taxOnly, setTaxOnly] = useState(false);
  const [actionOnly, setActionOnly] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tagInput, setTagInput] = useState('');
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const visible = useMemo(
    () =>
      searchLocalDocuments(
        documents,
        query,
        {
          category: filter !== 'all' && filter !== 'favorites' ? filter : undefined,
          taxRelevant: taxOnly ? true : undefined,
          actionRequired: actionOnly ? true : undefined,
        },
        sort,
      ).filter(({ document }) => filter !== 'favorites' || document.favorite),
    [documents, query, filter, sort, taxOnly, actionOnly],
  );
  return (
    <Page
      tab
      title={t('Documents', 'Dokumente')}
      subtitle={t(
        'Everything important, beautifully organized.',
        'Alles Wichtige. Übersichtlich sortiert.',
      )}
    >
      <SmartViewsSection />
      <View className="gap-sm rounded-lg border border-border bg-surface p-sm">
        <View className="flex-row items-center justify-between gap-sm">
          <Text className="font-manrope-semibold">{t('Bulk operations', 'Stapelaktionen')}</Text>
          <Button
            variant="outline"
            onPress={() => {
              setSelectionMode((value) => !value);
              setSelectedIds(new Set());
              setBulkResult(null);
            }}
          >
            <Text>{selectionMode ? t('Done', 'Fertig') : t('Select', 'Auswählen')}</Text>
          </Button>
        </View>
        {selectionMode && (
          <>
            <View className="flex-row gap-xs">
              <Button
                variant="ghost"
                onPress={() =>
                  setSelectedIds(new Set(visible.slice(0, 1000).map(({ document }) => document.id)))
                }
              >
                <Text>{t('Select all results', 'Alle Ergebnisse auswählen')}</Text>
              </Button>
              <Button variant="ghost" onPress={() => setSelectedIds(new Set())}>
                <Text>{t('Clear', 'Leeren')}</Text>
              </Button>
            </View>
            <Text className="text-xs text-muted-foreground">
              {selectedIds.size} {t('selected', 'ausgewählt')} · max. 1,000
            </Text>
            <Field
              label={t('Tags to add/remove', 'Hinzuzufügende/zu entfernende Tags')}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="tax, reviewed"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <Button
                variant="outline"
                disabled={!selectedIds.size || !tagInput.trim()}
                onPress={() => void applyBulk({ type: 'add_tags', tags: tagInput.split(',') })}
              >
                <Text>{t('Add tags', 'Tags hinzufügen')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size || !tagInput.trim()}
                onPress={() => void applyBulk({ type: 'remove_tags', tags: tagInput.split(',') })}
              >
                <Text>{t('Remove tags', 'Tags entfernen')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size}
                onPress={() => void applyBulk({ type: 'mark_tax_relevant', value: true })}
              >
                <Text>{t('Tax relevant', 'Steuerlich relevant')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size}
                onPress={() => void applyBulk({ type: 'assign_tax_year', year: 2026 })}
              >
                <Text>{t('Tax 2026', 'Steuer 2026')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size || !people[0]}
                onPress={() =>
                  void applyBulk({ type: 'assign_person', personId: people[0]?.id ?? null })
                }
              >
                <Text>{t('Assign person', 'Person zuweisen')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size || !organisations[0]}
                onPress={() =>
                  void applyBulk({
                    type: 'assign_organisation',
                    organisationId: organisations[0]?.id ?? null,
                  })
                }
              >
                <Text>{t('Assign organisation', 'Organisation zuweisen')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size || !cases[0]}
                onPress={() => void applyBulk({ type: 'add_to_case', caseId: cases[0]?.id ?? '' })}
              >
                <Text>{t('Add to case', 'Zum Fall hinzufügen')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size}
                onPress={() => void applyBulk({ type: 'archive' }, true)}
              >
                <Text>{t('Archive', 'Archivieren')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size}
                onPress={() => void applyBulk({ type: 'delete' }, true)}
              >
                <Text>{t('Delete', 'Löschen')}</Text>
              </Button>
              <Button
                variant="outline"
                disabled={!selectedIds.size}
                onPress={() =>
                  router.push({
                    pathname: '/export',
                    params: { documentIds: [...selectedIds].join(',') },
                  })
                }
              >
                <Text>{t('Export', 'Exportieren')}</Text>
              </Button>
            </ScrollView>
            {!!bulkResult && <Text className="text-sm text-muted-foreground">{bulkResult}</Text>}
          </>
        )}
      </View>
      <Field
        label={t('Search your documents', 'Dokumente durchsuchen')}
        placeholder={t('Title or sender…', 'Titel oder Absender…')}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() =>
          query.trim() &&
          setRecentSearches((items) =>
            [query.trim(), ...items.filter((item) => item !== query.trim())].slice(0, 5),
          )
        }
        autoCorrect={false}
      />
      {!!recentSearches.length && (
        <View className="gap-xs">
          <Text className="text-xs text-muted-foreground">
            {t('Recent searches', 'Letzte Suchen')}
          </Text>
          <Options
            value={query}
            onChange={setQuery}
            options={recentSearches.map((item) => ({ value: item, label: item }))}
          />
        </View>
      )}
      <Options
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('All', 'Alle') },
          { value: 'favorites', label: t('Starred', 'Favoriten') },
          ...Object.entries(categories).map(([value, label]) => ({
            value: value as Category,
            label: label[language],
          })),
        ]}
      />
      <Options
        value={sort}
        onChange={setSort}
        options={[
          { value: 'relevance', label: t('Relevance', 'Relevanz') },
          { value: 'newest', label: t('Newest', 'Neueste') },
          { value: 'oldest', label: t('Oldest', 'Älteste') },
          { value: 'expiry', label: t('Expiry', 'Ablauf') },
          { value: 'due', label: t('Due date', 'Fälligkeit') },
        ]}
      />
      <Options
        value={taxOnly ? 'tax' : actionOnly ? 'actions' : 'none'}
        onChange={(value) => {
          setTaxOnly(value === 'tax');
          setActionOnly(value === 'actions');
        }}
        options={[
          { value: 'none', label: t('All filters', 'Alle Filter') },
          { value: 'tax', label: t('Tax relevant', 'Steuerlich relevant') },
          { value: 'actions', label: t('Action required', 'Aktion nötig') },
        ]}
      />
      <Button onPress={() => router.push('/add-document')}>
        <Text>＋ {t('Add document', 'Dokument hinzufügen')}</Text>
      </Button>
      <Text className="text-xs text-muted-foreground">
        {visible.length} {t('DOCUMENTS', 'DOKUMENTE')}
      </Text>
      {visible.map(({ document }) => (
        <View key={document.id} className="gap-xs">
          {selectionMode && (
            <Button
              variant={selectedIds.has(document.id) ? 'secondary' : 'ghost'}
              onPress={() =>
                setSelectedIds((current) => {
                  const next = new Set(current);
                  if (next.has(document.id)) next.delete(document.id);
                  else if (next.size < 1000) next.add(document.id);
                  return next;
                })
              }
            >
              <Text>
                {selectedIds.has(document.id) ? '✓ ' : ''}
                {t('Select document', 'Dokument auswählen')}
              </Text>
            </Button>
          )}
          <DocumentItem document={document} />
          {!!query && (
            <Highlight
              value={`${document.issuer} · ${document.extractedText ?? document.summary ?? ''}`}
              query={query}
            />
          )}
        </View>
      ))}
      {!visible.length && (
        <EmptyState
          title={t('Nothing here yet', 'Noch nichts gefunden')}
          description={t(
            'Try another search or category.',
            'Versuche einen anderen Suchbegriff oder eine andere Kategorie.',
          )}
          action={{
            label: t('Reset filters', 'Filter zurücksetzen'),
            onPress: () => {
              setQuery('');
              setFilter('all');
            },
          }}
        />
      )}
    </Page>
  );

  async function applyBulk(
    operation: import('@meindocs/domain').BulkDocumentOperation,
    destructive = false,
  ) {
    const execute = async () => {
      const result = await bulkUpdateDocuments([...selectedIds], operation);
      setBulkResult(
        `${result.succeeded.length} ${t('succeeded', 'erfolgreich')} · ${result.failed.length} ${t('failed', 'fehlgeschlagen')}`,
      );
      setSelectedIds(new Set());
    };
    if (!destructive) return execute();
    Alert.alert(
      t('Confirm bulk change', 'Stapeländerung bestätigen'),
      t(
        'This cannot be undone for deleted documents.',
        'Gelöschte Dokumente können nicht wiederhergestellt werden.',
      ),
      [
        { text: t('Cancel', 'Abbrechen'), style: 'cancel' },
        { text: t('Continue', 'Fortfahren'), style: 'destructive', onPress: () => void execute() },
      ],
    );
  }
}
