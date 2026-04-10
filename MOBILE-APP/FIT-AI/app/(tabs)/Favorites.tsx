import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { Href, useRouter } from 'expo-router';
import React, { JSX } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FAVORITES = [
  { id: 1, title: 'Low Impact Starter', type: 'Bodyweight', duration: '20 min' },
  { id: 2, title: 'Cardio Ladder', type: 'Cardio', duration: '30 min' },
];

export default function Favorites(): JSX.Element {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headlineRow}>
          <Text style={styles.title}>Favorites</Text>
          <TouchableOpacity onPress={() => router.push('/explore' as Href)}>
            <Text style={styles.headlineAction}>Add More</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Your saved routines for faster workout starts.</Text>

        <View style={styles.list}>
          {FAVORITES.map((item) => (
            <View key={item.id} style={styles.favoriteCard}>
              <View>
                <Text style={styles.favoriteTitle}>{item.title}</Text>
                <Text style={styles.favoriteMeta}>{item.type}</Text>
              </View>
              <Text style={styles.favoriteDuration}>{item.duration}</Text>
            </View>
          ))}
        </View>

        <View style={styles.emptyHintCard}>
          <Text style={styles.emptyHintTitle}>Want more personalization?</Text>
          <Text style={styles.emptyHintSubtitle}>Open Explore and save workouts based on your activity level.</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/explore' as Href)}>
            <Text style={styles.ctaText}>Go to Explore</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabNav activeTab="Favorites" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UiTheme.colors.page },
  container: {
    padding: UiTheme.spacing.lg,
    paddingBottom: UiTheme.nav.height + UiTheme.spacing.xl,
    gap: UiTheme.spacing.sm,
  },
  headlineRow: {
    marginTop: UiTheme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: UiTheme.font.title, fontWeight: '800', color: UiTheme.colors.textPrimary },
  headlineAction: { fontSize: UiTheme.font.body, fontWeight: '800', color: UiTheme.colors.accent },
  subtitle: { fontSize: UiTheme.font.body, color: UiTheme.colors.textSecondary, marginBottom: UiTheme.spacing.xs },
  list: { gap: UiTheme.spacing.sm },
  favoriteCard: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    padding: UiTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteTitle: { color: UiTheme.colors.textPrimary, fontSize: 16, fontWeight: '800' },
  favoriteMeta: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body },
  favoriteDuration: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
  emptyHintCard: {
    marginTop: UiTheme.spacing.sm,
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    padding: UiTheme.spacing.md,
    gap: UiTheme.spacing.sm,
  },
  emptyHintTitle: { color: UiTheme.colors.textPrimary, fontWeight: '800', fontSize: 16 },
  emptyHintSubtitle: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body },
  ctaButton: {
    alignSelf: 'flex-start',
    backgroundColor: UiTheme.colors.accent,
    borderRadius: UiTheme.radius.sm,
    paddingHorizontal: UiTheme.spacing.md,
    paddingVertical: UiTheme.spacing.xs + 2,
  },
  ctaText: { color: UiTheme.colors.surface, fontWeight: '800' },
});
