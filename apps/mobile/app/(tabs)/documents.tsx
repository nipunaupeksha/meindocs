import { useState } from 'react';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/app/empty-state';
import { usePreview } from '@/features/preview/provider';
import { categories, type Category } from '@/features/preview/data';
import { DocumentItem, Field, Options, Page } from '@/features/preview/ui';
export default function DocumentsScreen() {
  const { t, language, documents } = usePreview();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const visible = documents
    .filter(
      (item) =>
        filter === 'all' || item.category === filter || (filter === 'favorites' && item.favorite),
    )
    .filter((item) =>
      `${item.title[language]} ${item.issuer}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
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
        autoCorrect={false}
      />
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
      <Button onPress={() => router.push('/add-document')}>
        <Text>＋ {t('Add document', 'Dokument hinzufügen')}</Text>
      </Button>
      <Text className="text-xs text-muted-foreground">
        {visible.length} {t('DOCUMENTS', 'DOKUMENTE')}
      </Text>
      {visible.map((document) => (
        <DocumentItem key={document.id} document={document} />
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
