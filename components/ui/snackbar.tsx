import { UiTheme } from '@/constants/ui-theme';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type SnackbarVariant = 'info' | 'success' | 'error';

type Props = {
  visible: boolean;
  message: string;
  variant?: SnackbarVariant;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  bottomOffset?: number;
};

export function Snackbar({
  visible,
  message,
  variant = 'info',
  actionLabel,
  onAction,
  onDismiss,
  bottomOffset = UiTheme.nav.height + UiTheme.spacing.lg,
}: Props): React.JSX.Element | null {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [anim, visible]);

  const backgroundColor = useMemo(() => {
    if (variant === 'success') return UiTheme.colors.success;
    if (variant === 'error') return UiTheme.colors.danger;
    return UiTheme.colors.accent;
  }, [variant]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrap,
        { bottom: bottomOffset },
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>

        {actionLabel && onAction ? (
          <TouchableOpacity onPress={onAction} style={styles.actionButton} activeOpacity={0.85}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}

        {onDismiss ? (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton} activeOpacity={0.85} accessibilityLabel="Dismiss">
            <Text style={styles.dismissText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: UiTheme.spacing.lg,
    right: UiTheme.spacing.lg,
    zIndex: 50,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UiTheme.spacing.sm,
    paddingHorizontal: UiTheme.spacing.md,
    borderRadius: UiTheme.radius.lg,
    ...UiTheme.shadow.floating,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: UiTheme.font.body,
    fontWeight: '700',
  },
  actionButton: {
    paddingHorizontal: UiTheme.spacing.sm,
    paddingVertical: 6,
    borderRadius: UiTheme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginLeft: UiTheme.spacing.sm,
  },
  actionText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: UiTheme.font.caption,
  },
  dismissButton: {
    marginLeft: UiTheme.spacing.xs,
    paddingHorizontal: UiTheme.spacing.xs,
    paddingVertical: 2,
  },
  dismissText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 22,
  },
});

