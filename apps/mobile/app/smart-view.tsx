import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Options, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { DocumentDomain, type SmartViewFilter } from '@meindocs/domain';

export default function SmartViewEditorScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { t, smartViews, createSmartView, updateSmartView } = usePreview();
  const existing = smartViews.find((view) => view.id === params.id);
  const [name, setName] = useState(existing?.name ?? '');
  const [filter, setFilter] = useState(
    existing?.filters.actionRequired
      ? 'action'
      : existing?.filters.taxRelevant
        ? 'tax'
        : existing?.filters.unpaidBill
          ? 'unpaid'
          : 'all',
  );
  const [domain, setDomain] = useState(existing?.filters.domain ?? '');
  const [customKey, setCustomKey] = useState('');
  const [customMinimum, setCustomMinimum] = useState('');
  const save = () => {
    const filters: SmartViewFilter = {
      ...(domain ? { domain: domain as DocumentDomain } : {}),
      ...(filter === 'action'
        ? { actionRequired: true }
        : filter === 'tax'
          ? { taxRelevant: true, taxYear: 2026 }
          : filter === 'unpaid'
            ? { unpaidBill: true }
            : {}),
      ...(customKey && customMinimum
        ? { customFields: { [customKey]: { gt: Number(customMinimum) } } }
        : {}),
    };
    if (existing) updateSmartView(existing.id, { name: name.trim() || existing.name, filters });
    else
      createSmartView({
        name: name.trim() || t('My Smart View', 'Meine Smart View'),
        icon: 'search',
        filters,
        sort: 'newest',
      });
    router.back();
  };
  return (
    <Page>
      <Text className="font-manrope-bold text-2xl">
        {existing
          ? t('Edit Smart View', 'Smart View bearbeiten')
          : t('Create Smart View', 'Smart View erstellen')}
      </Text>
      <Field
        label={t('Name', 'Name')}
        value={name}
        onChangeText={setName}
        placeholder={t('Freelance Expenses 2026', 'Freelance-Ausgaben 2026')}
      />
      <Options
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('All documents', 'Alle Dokumente') },
          { value: 'action', label: t('Action required', 'Aktion erforderlich') },
          { value: 'tax', label: t('Tax relevant', 'Steuerlich relevant') },
          { value: 'unpaid', label: t('Unpaid bills', 'Unbezahlte Rechnungen') },
        ]}
      />
      <Options
        value={domain}
        onChange={setDomain}
        options={[
          { value: '', label: t('Any domain', 'Alle Bereiche') },
          { value: 'housing', label: t('Housing', 'Wohnen') },
          { value: 'insurance', label: t('Insurance', 'Versicherung') },
          { value: 'employment', label: t('Employment', 'Beschäftigung') },
          { value: 'identity', label: t('Immigration / identity', 'Einwanderung / Identität') },
        ]}
      />
      <Field
        label={t(
          'Custom field key (optional)',
          'Schlüssel des benutzerdefinierten Feldes (optional)',
        )}
        value={customKey}
        onChangeText={setCustomKey}
        placeholder="business_usage"
      />
      <Field
        label={t('Custom field greater than', 'Benutzerdefiniertes Feld größer als')}
        value={customMinimum}
        onChangeText={setCustomMinimum}
        keyboardType="numeric"
        placeholder="0"
      />
      <Button onPress={save}>
        <Text>{t('Save Smart View', 'Smart View speichern')}</Text>
      </Button>
    </Page>
  );
}
