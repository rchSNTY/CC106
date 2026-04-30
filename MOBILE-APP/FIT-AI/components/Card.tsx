import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  coverImage?: ImageSourcePropType;
  reserveCoverSpace?: boolean;
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
  coverImage,
  reserveCoverSpace = false,
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
      {coverImage ? (
        <Image source={coverImage} style={styles.coverImage} resizeMode="cover" />
      ) : reserveCoverSpace ? (
        <View style={[styles.coverImage, styles.coverPlaceholder]} />
      ) : null}
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
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 120,
    borderRadius: UiTheme.radius.md,
    marginBottom: UiTheme.spacing.sm,
  },
  coverPlaceholder: {
    backgroundColor: UiTheme.colors.surfaceMuted,
  },
  elevated: {
    ...UiTheme.shadow.card,
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
