import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/app/card';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { storageNames, type StorageId } from './data';
import { usePreview } from './provider';
import { Icon } from './ui';

const providers: StorageId[] = ['local', 'icloud', 'google', 'onedrive'];
function isConnected(id: StorageId, connections: Record<string, boolean>) {
  return id === 'local' || Boolean(connections[id]);
}
function StorageCard({ id, chooseFolder }: { id: StorageId; chooseFolder: () => void }) {
  const { t, connections, setConnections, folders, settings, setSettings, notify } = usePreview();
  const connected = isConnected(id, connections);
  const selected = settings.storage === id;
  function connect() {
    setConnections((previous) => ({ ...previous, [id]: !connected }));
    if (selected && connected) setSettings((previous) => ({ ...previous, storage: 'local' }));
    notify('Storage connection updated in preview', 'Speicherverbindung in der Vorschau geändert');
  }
  function select() {
    setSettings((previous) => ({ ...previous, storage: id }));
    notify('Default destination updated', 'Standard-Speicherort geändert');
  }
  return (
    <Card className={selected ? 'border-primary' : ''}>
      <StorageIdentity id={id} connected={connected} selected={selected} />
      {connected && (
        <Pressable
          onPress={chooseFolder}
          accessibilityRole="button"
          accessibilityLabel={t('Choose folder', 'Ordner auswählen')}
          className="flex-row items-center gap-sm rounded-md bg-background p-md"
        >
          <Icon name="folder-outline" size={18} />
          <Text className="flex-1 text-sm">{folders[id]}</Text>
          <Icon name="chevron-forward" size={16} />
        </Pressable>
      )}
      {!selected && (
        <Button variant="secondary" disabled={!connected} onPress={select}>
          <Text>{t('Use as default location', 'Als Standard verwenden')}</Text>
        </Button>
      )}
      <ConnectionButton id={id} connected={connected} onPress={connect} />
    </Card>
  );
}
function StorageIdentity({
  id,
  connected,
  selected,
}: {
  id: StorageId;
  connected: boolean;
  selected: boolean;
}) {
  const { t } = usePreview();
  const descriptions = {
    local: t('Local folder · preview location', 'Lokaler Ordner · Vorschau-Speicherort'),
    connected: t('Demo account · not authenticated', 'Demokonto · nicht authentifiziert'),
    disconnected: t('Not connected', 'Nicht verbunden'),
  };
  const description =
    id === 'local' ? descriptions.local : descriptions[connected ? 'connected' : 'disconnected'];
  return (
    <View className="gap-sm">
      <StorageTitle id={id} selected={selected} />
      <Text className="text-sm text-muted-foreground">{description}</Text>
    </View>
  );
}
function StorageTitle({ id, selected }: { id: StorageId; selected: boolean }) {
  const { t } = usePreview();
  return (
    <View className="flex-row items-center gap-sm">
      <Icon name={id === 'local' ? 'phone-portrait-outline' : 'cloud-outline'} />
      <Text className="flex-1 font-manrope-semibold">
        {id === 'local' ? t('On this device', 'Auf diesem Gerät') : storageNames[id]}
      </Text>
      {selected && <StatusBadge label={t('Default', 'Standard')} tone="success" />}
    </View>
  );
}
function ConnectionButton({
  id,
  connected,
  onPress,
}: {
  id: StorageId;
  connected: boolean;
  onPress: () => void;
}) {
  const { t } = usePreview();
  if (id === 'local') return null;
  return (
    <Button variant="outline" onPress={onPress}>
      <Text>
        {connected
          ? t('Disconnect demo account', 'Demokonto trennen')
          : t('Preview connection', 'Verbindung simulieren')}
      </Text>
    </Button>
  );
}
function FolderPicker({ provider, onClose }: { provider: StorageId; onClose: () => void }) {
  const { t, folders, setFolders, notify } = usePreview();
  const candidates =
    provider === 'local'
      ? ['Documents/MeinDocs', 'Documents/Personal', 'Documents/Tax/2026']
      : ['MeinDocs', 'Documents/Personal', 'Documents/Tax/2026'];
  const [selected, setSelected] = useState(folders[provider]);
  function save() {
    setFolders((previous) => ({ ...previous, [provider]: selected }));
    onClose();
    notify('Folder selected in preview', 'Ordner in der Vorschau ausgewählt');
  }
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} visible>
      <View style={{ backgroundColor: 'rgba(23,32,31,0.4)' }} className="flex-1 justify-end">
        <SafeAreaView
          style={{ maxHeight: '85%' }}
          edges={['bottom']}
          className="rounded-t-3xl bg-surface"
        >
          <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-manrope-bold text-xl">
                {t('Choose a folder', 'Ordner auswählen')}
              </Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t('Close', 'Schließen')}
                className="h-12 w-12 items-center justify-center"
              >
                <Icon name="close" />
              </Pressable>
            </View>
            <Text className="text-sm text-muted-foreground">
              {t(
                'Sample directories only. No device or cloud files are accessed.',
                'Nur Beispielordner. Kein Zugriff auf Geräte- oder Cloud-Dateien.',
              )}
            </Text>
            {candidates.map((path) => (
              <Pressable
                key={path}
                accessibilityRole="radio"
                accessibilityState={{ checked: path === selected }}
                onPress={() => setSelected(path)}
                className="flex-row items-center gap-md rounded-lg border border-border p-md"
              >
                <Icon name="folder-outline" />
                <Text className="flex-1">{path}</Text>
                {selected === path && <Icon name="checkmark-circle" />}
              </Pressable>
            ))}
            <Button onPress={save}>
              <Text>{t('Use this folder', 'Diesen Ordner verwenden')}</Text>
            </Button>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
export function StorageSettings() {
  const [picker, setPicker] = useState<StorageId | null>(null);
  return (
    <View className="gap-md">
      {providers.map((id) => (
        <StorageCard key={id} id={id} chooseFolder={() => setPicker(id)} />
      ))}
      {picker && <FolderPicker key={picker} provider={picker} onClose={() => setPicker(null)} />}
    </View>
  );
}
