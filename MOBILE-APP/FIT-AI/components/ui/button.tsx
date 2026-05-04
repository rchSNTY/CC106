import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  rightIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  leftIconName,
  rightIconName,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading || !onPress);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        stylesByVariant[variant],
        stylesBySize[size],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      hitSlop={10}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? UiTheme.colors.surface : UiTheme.colors.accent} />
        ) : leftIconName ? (
          <MaterialIcons
            name={leftIconName}
            size={18}
            color={variant === 'primary' || variant === 'destructive' ? UiTheme.colors.surface : UiTheme.colors.textPrimary}
          />
        ) : null}

        <ThemedText
          type="defaultSemiBold"
          style={[
            styles.text,
            variant === 'primary' || variant === 'destructive' ? styles.textOnSolid : null,
            variant === 'ghost' ? styles.textGhost : null,
          ]}
        >
          {title}
        </ThemedText>

        {!loading && rightIconName ? (
          <MaterialIcons
            name={rightIconName}
            size={18}
            color={variant === 'primary' || variant === 'destructive' ? UiTheme.colors.surface : UiTheme.colors.textPrimary}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: UiTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { fontWeight: '800' },
  textOnSolid: { color: UiTheme.colors.surface },
  textGhost: { color: UiTheme.colors.accent },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.6 },
});

const stylesByVariant = StyleSheet.create({
  primary: { backgroundColor: UiTheme.colors.accent, borderColor: UiTheme.colors.accent },
  secondary: { backgroundColor: UiTheme.colors.surface, borderColor: UiTheme.colors.border },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  destructive: { backgroundColor: UiTheme.colors.danger, borderColor: UiTheme.colors.danger },
} as Record<ButtonVariant, ViewStyle>);

const stylesBySize = StyleSheet.create({
  sm: { minHeight: 40, paddingHorizontal: 14 },
  md: { minHeight: 48, paddingHorizontal: 16 },
  lg: { minHeight: 56, paddingHorizontal: 18 },
} as Record<ButtonSize, ViewStyle>);

