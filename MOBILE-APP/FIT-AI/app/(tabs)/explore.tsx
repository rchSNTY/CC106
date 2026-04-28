import { Card } from '@/components/Card';
import RoutineDetailsModal, { type Routine } from '@/components/RoutineDetailsModal';
import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { getApiErrorMessage, listWorkouts } from '@/services/backend';
import { Image } from 'expo-image';
import React, { JSX, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

type Intensity = 'All' | 'Light' | 'Moderate' | 'Intense';

const FILTERS: Intensity[] = ['All', 'Light', 'Moderate', 'Intense'];

export default function Explore(): JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Intensity>('All');
  const [workouts, setWorkouts] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const result = await listWorkouts(activeFilter, query);
        if (!isMounted) {
          return;
        }

        setWorkouts(
          result.map((item) => ({
            ...item,
            exercises: item.exercises.map((exercise) => ({ ...exercise })),
          })),
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
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
          <Text style={styles.sectionMeta}>{workouts.length} items</Text>
        </View>

        {isLoading ? <Text style={styles.statusText}>Loading workouts...</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.cardList}>
          {workouts.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              duration={item.duration}
              badges={item.intensity ? [item.intensity] : []}
              onPress={() => {
                setSelectedRoutine(item);
                setModalVisible(true);
              }}
              accessibilityLabel={`Open ${item.title} routine details`}
            />
          ))}

          {!isLoading && !errorMessage && workouts.length === 0 ? (
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
          if (selectedRoutine) {
            setModalVisible(false);
            router.push({
              pathname: '/active-workout',
              params: { routine: JSON.stringify(selectedRoutine) },
            });
            setSelectedRoutine(null);
          }
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
  statusText: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body, fontWeight: '600' },
  errorText: { color: UiTheme.colors.danger, fontSize: UiTheme.font.body, fontWeight: '600' },
});
