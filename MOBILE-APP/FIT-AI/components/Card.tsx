import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

export type CardProps = {
  title?: string;
  subtitle?: string;
  duration?: string;
  badges?: string[];
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  activeOpacity?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

export function Card({
  title,
  subtitle,
  duration,
  badges = [],
  variant = 'default',
  onPress,
  activeOpacity = 0.85,
  accessibilityLabel,
  accessibilityHint,
  footer,
  children,
}: CardProps) {
  const borderColor = UiTheme.colors.border;
  const surfaceColor = UiTheme.colors.surface;

  const cardStyle = [
    styles.container,
    { backgroundColor: surfaceColor, borderColor },
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
  ];

  const content = (
    <View style={cardStyle}>
      {(title || duration) && (
        <View style={styles.header}>
          {title && <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>}
          {duration && <ThemedText style={styles.duration}>{duration}</ThemedText>}
        </View>
      )}
      {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
      {badges.length > 0 && (
        <View style={styles.badgeRow}>
          {badges.map((badge, index) => (
            <View key={index} style={styles.badge}>
              <ThemedText style={styles.badgeText}>{badge}</ThemedText>
            </View>
          ))}
        </View>
      )}
      {children}
      {footer}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: UiTheme.radius.lg,
    borderWidth: 1,
    padding: UiTheme.spacing.md,
    gap: UiTheme.spacing.xs,
  },
  elevated: {
    shadowColor: UiTheme.colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outlined: {
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginRight: UiTheme.spacing.sm,
  },
  duration: {
    fontSize: UiTheme.font.caption,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: UiTheme.font.body,
  },
  badgeRow: {
    marginTop: UiTheme.spacing.xs,
    flexDirection: 'row',
    gap: UiTheme.spacing.xs,
  },
  badge: {
    backgroundColor: UiTheme.colors.surfaceMuted,
    borderRadius: UiTheme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: UiTheme.spacing.sm,
  },
  badgeText: {
    fontSize: UiTheme.font.caption,
    fontWeight: '700',
  },
});