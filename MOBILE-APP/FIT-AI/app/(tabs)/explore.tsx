import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { Image } from 'expo-image';
import React, { JSX, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Intensity = 'All' | 'Light' | 'Moderate' | 'Intense';

type WorkoutCard = {
  id: number;
  name: string;
  type: string;
  intensity: Exclude<Intensity, 'All'>;
  duration: string;
};

const FILTERS: Intensity[] = ['All', 'Light', 'Moderate', 'Intense'];

const WORKOUTS: WorkoutCard[] = [
  { id: 1, name: 'Morning Mobility Flow', type: 'Bodyweight', intensity: 'Light', duration: '15 min' },
  { id: 2, name: 'Endurance Burn', type: 'Cardio', intensity: 'Moderate', duration: '30 min' },
  { id: 3, name: 'Strength Circuit', type: 'Weights', intensity: 'Intense', duration: '45 min' },
  { id: 4, name: 'Core Starter', type: 'Bodyweight', intensity: 'Moderate', duration: '20 min' },
];

export default function Explore(): JSX.Element {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Intensity>('All');

  const visibleWorkouts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return WORKOUTS.filter((item) => {
      const matchesFilter = activeFilter === 'All' || item.intensity === activeFilter;
      const matchesQuery =
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        item.type.toLowerCase().includes(normalized);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.browseTitle}>Discover Workouts</Text>
        <Text style={styles.browseSubtitle}>Search routines and narrow by intensity.</Text>

        <View style={styles.searchWrap}>
          <Image source={require('@/assets/images/search.png')} style={styles.searchIcon} contentFit="contain" />
          <TextInput
            placeholder="Search by title or workout type"
            placeholderTextColor="#7A8A99"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const selected = filter === activeFilter;

            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, selected && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Results</Text>
          <Text style={styles.sectionMeta}>{visibleWorkouts.length} items</Text>
        </View>

        <View style={styles.cardList}>
          {visibleWorkouts.map((item) => (
            <View key={item.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{item.name}</Text>
                <Text style={styles.workoutDuration}>{item.duration}</Text>
              </View>
              <Text style={styles.workoutType}>{item.type}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.intensity}</Text>
                </View>
              </View>
            </View>
          ))}

          {visibleWorkouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No workouts found</Text>
              <Text style={styles.emptySubtitle}>Try another search keyword or switch filter.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <BottomTabNav activeTab="explore" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UiTheme.colors.page },
  container: {
    padding: UiTheme.spacing.lg,
    paddingBottom: UiTheme.nav.height + UiTheme.spacing.xl,
    gap: UiTheme.spacing.md,
  },
  browseTitle: {
    marginTop: UiTheme.spacing.xl,
    fontSize: UiTheme.font.title,
    fontWeight: '800',
    color: UiTheme.colors.textPrimary,
  },
  browseSubtitle: {
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.body,
    marginTop: -4,
  },
  searchWrap: {
    width: '100%',
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.xl,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
  },
  searchIcon: { width: 18, height: 18, marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: UiTheme.colors.textPrimary,
    fontWeight: '600',
  },
  filterRow: { flexDirection: 'row', gap: UiTheme.spacing.xs },
  filterChip: {
    paddingVertical: UiTheme.spacing.xs,
    paddingHorizontal: UiTheme.spacing.md,
    borderRadius: UiTheme.radius.xl,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    backgroundColor: UiTheme.colors.surface,
  },
  filterChipActive: { backgroundColor: UiTheme.colors.accentSoft, borderColor: UiTheme.colors.accent },
  filterText: { color: UiTheme.colors.textSecondary, fontWeight: '700', fontSize: UiTheme.font.caption },
  filterTextActive: { color: UiTheme.colors.accent },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: UiTheme.font.subtitle, fontWeight: '800', color: UiTheme.colors.textPrimary },
  sectionMeta: { fontSize: UiTheme.font.caption, fontWeight: '700', color: UiTheme.colors.textSecondary },
  cardList: { gap: UiTheme.spacing.sm },
  workoutCard: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    padding: UiTheme.spacing.md,
    gap: UiTheme.spacing.xs,
  },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workoutName: { color: UiTheme.colors.textPrimary, fontSize: 16, fontWeight: '800', flex: 1, marginRight: UiTheme.spacing.sm },
  workoutDuration: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
  workoutType: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body },
  badgeRow: { marginTop: UiTheme.spacing.xs, flexDirection: 'row' },
  badge: {
    backgroundColor: UiTheme.colors.surfaceMuted,
    borderRadius: UiTheme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: UiTheme.spacing.sm,
  },
  badgeText: { color: UiTheme.colors.textPrimary, fontSize: UiTheme.font.caption, fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: UiTheme.spacing.xl,
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    gap: UiTheme.spacing.xs,
  },
  emptyTitle: { color: UiTheme.colors.textPrimary, fontSize: 16, fontWeight: '800' },
  emptySubtitle: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body },
});
