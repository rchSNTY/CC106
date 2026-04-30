import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';

import { ErrorText } from '@/components/ErrorText';
import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helperText?: string;
  error?: string | null;
  leftIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  helperText,
  error,
  leftIconName,
  containerStyle,
  inputWrapStyle,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = useMemo(() => {
    if (error) {
      return UiTheme.colors.danger;
    }
    if (focused) {
      return UiTheme.colors.focusRing;
    }
    return UiTheme.colors.border;
  }, [error, focused]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}

      <View style={[styles.inputWrap, { borderColor }, focused ? styles.inputWrapFocused : null, inputWrapStyle]}>
        {leftIconName ? (
          <MaterialIcons name={leftIconName} size={18} color={UiTheme.colors.textSecondary} />
        ) : null}

        <TextInput
          {...rest}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={UiTheme.colors.textSecondary}
          style={[styles.input, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null]}
        />
      </View>

      {helperText && !error ? <ThemedText style={styles.helper}>{helperText}</ThemedText> : null}
      <ErrorText error={error ?? undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: UiTheme.colors.textPrimary },
  helper: { fontSize: UiTheme.font.caption, color: UiTheme.colors.textSecondary, marginTop: 2 },
  inputWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: UiTheme.radius.md,
    backgroundColor: UiTheme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  inputWrapFocused: {
    shadowColor: UiTheme.colors.focusRing,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: UiTheme.colors.textPrimary,
    fontWeight: '600',
    paddingVertical: 10,
  },
});

