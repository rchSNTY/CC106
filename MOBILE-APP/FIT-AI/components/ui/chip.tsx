import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected, disabled, onPress, style }: ChipProps) {
  const isDisabled = Boolean(disabled || !onPress);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
      hitSlop={8}
    >
      <ThemedText style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: UiTheme.spacing.xs,
    paddingHorizontal: UiTheme.spacing.md,
    borderRadius: UiTheme.radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  selected: { backgroundColor: UiTheme.colors.accentSoft, borderColor: UiTheme.colors.accent },
  unselected: { backgroundColor: UiTheme.colors.surface, borderColor: UiTheme.colors.border },
  text: { fontSize: UiTheme.font.caption, fontWeight: '800' },
  textSelected: { color: UiTheme.colors.accent },
  textUnselected: { color: UiTheme.colors.textSecondary },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.55 },
});

