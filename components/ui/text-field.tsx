import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { ErrorText } from '@/components/ErrorText';
import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helperText?: string;
  error?: string | null;
  leftIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  rightIconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapStyle?: StyleProp<ViewStyle>;
  onRightIconPress?: () => void;
};

export const TextField = React.memo(function TextField({
  label,
  helperText,
  error,
  leftIconName,
  rightIconName,
  containerStyle,
  inputWrapStyle,
  onFocus,
  onBlur,
  secureTextEntry,
  onRightIconPress,
  ...rest
}: TextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = useMemo(() => {
    return error ? UiTheme.colors.danger : UiTheme.colors.border;
  }, [error]);

  const handleFocus = useCallback(
    (event: any) => {
      onFocus?.(event);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (event: any) => {
      onBlur?.(event);
    },
    [onBlur]
  );

  const handleRightIconPress = useCallback(() => {
    if (secureTextEntry) {
      setIsPasswordVisible(!isPasswordVisible);
    }
    onRightIconPress?.();
  }, [secureTextEntry, isPasswordVisible, onRightIconPress]);

  const displayedRightIcon = secureTextEntry
    ? isPasswordVisible
      ? 'visibility-off'
      : 'visibility'
    : rightIconName;

  const shouldSecureText = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}

      <View style={[styles.inputWrap, { borderColor }, inputWrapStyle]}>
        {leftIconName ? (
          <MaterialIcons
            name={leftIconName}
            size={18}
            color={UiTheme.colors.textSecondary}
          />
        ) : null}

        <TextInput
          {...rest}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={shouldSecureText}
          placeholderTextColor={UiTheme.colors.textSecondary}
          style={[
            styles.input,
            Platform.OS === 'web'
              ? ({ outlineStyle: 'none' } as any)
              : null,
          ]}
        />

        {displayedRightIcon || secureTextEntry ? (
          <Pressable
            onPress={handleRightIconPress}
            style={styles.iconButton}
            hitSlop={8}
          >
            <MaterialIcons
              name={displayedRightIcon || 'visibility'}
              size={18}
              color={UiTheme.colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {helperText && !error ? (
        <ThemedText style={styles.helper}>{helperText}</ThemedText>
      ) : null}

      <ErrorText error={error ?? undefined} />
    </View>
  );
});

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
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: UiTheme.colors.textPrimary,
    fontWeight: '600',
    paddingVertical: 10,
  },
  iconButton: {
    padding: 4,
  },
});
