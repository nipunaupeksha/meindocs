import { useMemo, useState } from 'react';
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
  const { t, language, documents } = usePreview();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<LocalSearchSort>('relevance');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [taxOnly, setTaxOnly] = useState(false);
  const [actionOnly, setActionOnly] = useState(false);
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
}
