import { Card } from '@/components/Card';
import RoutineDetailsModal, { type Routine } from '@/components/RoutineDetailsModal';
import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { Image } from 'expo-image';
import React, { JSX, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Intensity = 'All' | 'Light' | 'Moderate' | 'Intense';

const FILTERS: Intensity[] = ['All', 'Light', 'Moderate', 'Intense'];

const WORKOUTS: Routine[] = [
  {
    id: 1,
    title: 'Morning Mobility Flow',
    subtitle: 'Bodyweight',
    intensity: 'Light',
    duration: '15 min',
    exercises: [
      { id: 1, name: 'Cat-Cow Stretch', detail: 'Slow movement to warm up the spine.', reps: '10 reps' },
      { id: 2, name: 'Hip Circles', detail: 'Mobilize the hips in both directions.', reps: '8 each side' },
      { id: 3, name: 'Shoulder Rolls', detail: 'Improve upper body mobility and posture.', reps: '10 reps' },
    ],
  },
  {
    id: 2,
    title: 'Endurance Burn',
    subtitle: 'Cardio',
    intensity: 'Moderate',
    duration: '30 min',
    exercises: [
      { id: 1, name: 'Jumping Jacks', detail: 'Raise heart rate steadily.', reps: '2 min' },
      { id: 2, name: 'Mountain Climbers', detail: 'Drive knees toward chest at a steady pace.', reps: '45 sec' },
      { id: 3, name: 'High Knees', detail: 'Maintain a quick rhythm with tall posture.', reps: '60 sec' },
    ],
  },
  {
    id: 3,
    title: 'Strength Circuit',
    subtitle: 'Weights',
    intensity: 'Intense',
    duration: '45 min',
    exercises: [
      { id: 1, name: 'Goblet Squat', detail: 'Hold weight at chest and squat deeply.', reps: '12 reps' },
      { id: 2, name: 'Dumbbell Row', detail: 'Pull weight toward hip with control.', reps: '10 reps each side' },
      { id: 3, name: 'Plank Hold', detail: 'Maintain a solid core line.', reps: '60 sec' },
    ],
  },
  {
    id: 4,
    title: 'Core Starter',
    subtitle: 'Bodyweight',
    intensity: 'Moderate',
    duration: '20 min',
    exercises: [
      { id: 1, name: 'Dead Bug', detail: 'Slow, controlled core stability work.', reps: '12 reps each side' },
      { id: 2, name: 'Side Plank', detail: 'Hold posture with hips lifted.', reps: '30 sec each side' },
      { id: 3, name: 'Glute Bridge', detail: 'Activate posterior chain and core.', reps: '15 reps' },
    ],
  },
];

export default function Explore(): JSX.Element {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Intensity>('All');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const visibleWorkouts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return WORKOUTS.filter((item) => {
      const matchesFilter = activeFilter === 'All' || item.intensity === activeFilter;
      const matchesQuery =
        normalized.length === 0 ||
        item.title.toLowerCase().includes(normalized) ||
        item.subtitle?.toLowerCase().includes(normalized);

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
            placeholderTextColor={UiTheme.colors.textSecondary}
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
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              duration={item.duration}
              badges={[item.intensity]}
              onPress={() => {
                setSelectedRoutine(item);
                setModalVisible(true);
              }}
              accessibilityLabel={`Open ${item.title} routine details`}
            />
          ))}

          {visibleWorkouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No workouts found</Text>
              <Text style={styles.emptySubtitle}>Try another search keyword or switch filter.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <RoutineDetailsModal
        visible={modalVisible}
        routine={selectedRoutine}
        onClose={() => {
          setModalVisible(false);
          setSelectedRoutine(null);
        }}
        onStart={() => {
          setModalVisible(false);
          setSelectedRoutine(null);
        }}
      />

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
