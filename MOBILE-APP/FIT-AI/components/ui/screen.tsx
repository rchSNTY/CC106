import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type ScrollViewProps,
  View,
} from 'react-native';

import { UiTheme } from '@/constants/ui-theme';

export type ScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  withBottomNavPadding?: boolean;
};

export function Screen({
  children,
  style,
  contentContainerStyle,
  scroll = true,
  scrollProps,
  withBottomNavPadding = true,
}: ScreenProps) {
  const paddingBottom = withBottomNavPadding ? UiTheme.nav.height + UiTheme.spacing.xl : UiTheme.spacing.xl;

  return (
    <SafeAreaView style={[styles.safe, style]}>
      {scroll ? (
        <ScrollView
          {...scrollProps}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom }, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { paddingBottom }, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UiTheme.colors.page },
  content: { flexGrow: 1, paddingHorizontal: UiTheme.spacing.lg, paddingTop: UiTheme.spacing.lg, gap: UiTheme.spacing.md },
});

