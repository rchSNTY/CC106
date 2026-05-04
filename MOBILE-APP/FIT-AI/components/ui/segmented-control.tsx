import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

export type SegmentedOption<T extends string> = { key: T; label: string; disabled?: boolean };

export type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (next: T) => void;
  testID?: string;
};

export function SegmentedControl<T extends string>({ value, options, onChange, testID }: SegmentedControlProps<T>) {
  return (
    <View testID={testID} style={styles.wrap}>
      {options.map((opt) => {
        const active = opt.key === value;
        const disabled = Boolean(opt.disabled);

        return (
          <Pressable
            key={opt.key}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            disabled={disabled}
            onPress={() => onChange(opt.key)}
            style={({ pressed }) => [
              styles.item,
              active ? styles.itemActive : null,
              disabled ? styles.itemDisabled : null,
              pressed && !disabled ? styles.itemPressed : null,
            ]}
          >
            <ThemedText style={[styles.text, active ? styles.textActive : styles.textIdle]}>{opt.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.xl,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    overflow: 'hidden',
  },
  item: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: UiTheme.spacing.md },
  itemActive: { backgroundColor: UiTheme.colors.accentSoft },
  itemPressed: { opacity: 0.9 },
  itemDisabled: { opacity: 0.55 },
  text: { fontSize: UiTheme.font.caption, fontWeight: '800' },
  textActive: { color: UiTheme.colors.accent },
  textIdle: { color: UiTheme.colors.textSecondary },
});

