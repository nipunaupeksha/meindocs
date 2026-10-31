import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { colors } from '@meindocs/ui';
import { languageOptions, type SupportedLanguage } from './languages';

export function LanguageSelector({
  value,
  onChange,
}: {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = languageOptions.find((option) => option.value === value) ?? languageOptions[0];

  return (
    <View className="gap-xs">
      <Button
        variant="outline"
        accessibilityLabel={`Language: ${selected.label}`}
        accessibilityState={{ expanded: open }}
        className="min-h-12 justify-between rounded-xl border-primary/30 bg-transparent px-md"
        onPress={() => setOpen((current) => !current)}
      >
        <View className="flex-row items-center gap-sm">
          <Text className="text-lg">{selected.flag}</Text>
          <Text className="text-foreground">{selected.label}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} color={colors.primary} size={18} />
      </Button>
      {open && (
        <View className="max-h-60 overflow-hidden rounded-xl border border-border bg-surface">
          {languageOptions.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: option.value === value }}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="min-h-12 flex-row items-center gap-sm border-b border-border px-md py-sm last:border-b-0"
            >
              <Text className="text-lg">{option.flag}</Text>
              <Text className="flex-1">{option.label}</Text>
              {option.value === value && <Ionicons name="checkmark" color={colors.primary} size={18} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
