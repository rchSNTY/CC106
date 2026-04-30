import { Card } from '@/components/Card';
import { ConfirmationModal } from '@/components/confirmation-modal';
import RoutineDetailsModal, { type Routine } from '@/components/RoutineDetailsModal';
import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { ApiError, addFavorite, clearGeneratedAiWorkouts, deleteWorkout, generateAiWorkout, getApiErrorMessage, listFavorites, listGeneratedAiWorkouts, listWorkouts, removeFavorite } from '@/services/backend';
import { useUserProfile } from '@/stores/user-profile';
import { getAiWorkoutPreset } from '@/utils/ai-workout';
import { resolveWorkoutImage } from '@/utils/imageResolution';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Intensity = 'All' | 'Light' | 'Moderate' | 'Intense';

const FILTERS: Intensity[] = ['All', 'Light', 'Moderate', 'Intense'];

export default function Explore(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ ai?: string; intensity?: string; search?: string }>();
  const { profile } = useUserProfile();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Intensity>('All');
  const [workoutView, setWorkoutView] = useState<'presets' | 'generated'>('presets');
  const [workouts, setWorkouts] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [showDeleteGeneratedPrompt, setShowDeleteGeneratedPrompt] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isClearingAi, setIsClearingAi] = useState(false);
  const [generatedWorkoutCount, setGeneratedWorkoutCount] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteSelectedPrompt, setShowDeleteSelectedPrompt] = useState(false);

  const aiPreset = useMemo(() => getAiWorkoutPreset(profile), [profile]);

  useEffect(() => {
    if (params.ai !== '1') {
      return;
    }

    const nextIntensity = params.intensity === 'Light' || params.intensity === 'Moderate' || params.intensity === 'Intense'
      ? params.intensity
      : aiPreset.intensity;

    setActiveFilter(nextIntensity);
    setQuery(typeof params.search === 'string' ? params.search : aiPreset.search);
  }, [aiPreset.intensity, aiPreset.search, params.ai, params.intensity, params.search]);

  const refreshWorkouts = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [generatedWorkouts, presetWorkouts] = await Promise.all([
        listGeneratedAiWorkouts(),
        workoutView === 'presets' ? listWorkouts(activeFilter, query) : Promise.resolve([]),
      ]);

      const search = query.trim().toLowerCase();
      const matchesSearch = (item: { title: string; subtitle: string }) =>
        search.length === 0 || item.title.toLowerCase().includes(search) || item.subtitle.toLowerCase().includes(search);

      const visiblePresets = workoutView === 'presets'
        ? presetWorkouts.filter((item) => activeFilter === 'All' || item.intensity === activeFilter).filter(matchesSearch)
        : [];

      const visibleGenerated = workoutView === 'generated'
        ? generatedWorkouts.filter((item) => activeFilter === 'All' || item.intensity === activeFilter).filter(matchesSearch)
        : [];

      setGeneratedWorkoutCount(generatedWorkouts.length);

      const merged = [...visibleGenerated, ...visiblePresets]
        .filter((item, index, self) => self.findIndex((candidate) => candidate.id === item.id) === index)
        .map((item) => ({
          ...item,
          exercises: item.exercises.map((exercise) => ({ ...exercise, steps: (exercise as any).steps ?? [] })),
      }));

      setWorkouts(merged);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, query, workoutView]);

  useEffect(() => {
    void refreshWorkouts();
  }, [refreshWorkouts]);

  const handleAiLaunch = () => {
    if (!aiPreset.isReady) {
      Alert.alert('Profile incomplete', 'Complete your profile first so AI suggestions can match your goal.');
      return;
    }

    setShowAiPrompt(true);
  };

  const handleAiConfirm = useCallback(async () => {
    setShowAiPrompt(false);
    setIsGeneratingAi(true);
    setErrorMessage(null);

    // Validate profile before sending
    if (!profile.name || !profile.name.trim()) {
      Alert.alert('Incomplete Profile', 'Please enter your name in your profile.');
      setIsGeneratingAi(false);
      return;
    }
    if (!profile.activityLevel || !profile.activityLevel.trim()) {
      Alert.alert('Incomplete Profile', 'Please select an activity level in your profile.');
      setIsGeneratingAi(false);
      return;
    }
    if (!profile.workout || !profile.workout.trim()) {
      Alert.alert('Incomplete Profile', 'Please select a workout type in your profile.');
      setIsGeneratingAi(false);
      return;
    }

    try {
      console.log('Sending AI generation request with profile:', {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        activityLevel: profile.activityLevel,
        workout: profile.workout,
        weeklyGoal: profile.weeklyGoal,
      });

      const aiWorkouts = await generateAiWorkout({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        activityLevel: profile.activityLevel,
        workout: profile.workout,
        weeklyGoal: profile.weeklyGoal,
      });

      const routines: Routine[] = aiWorkouts.map((aiWorkout) => ({
        ...aiWorkout,
        exercises: aiWorkout.exercises.map((exercise) => ({
          ...exercise,
          steps: exercise.steps ?? [],
        })),
      }));

      setWorkoutView('generated');
      setWorkouts(routines);
      setActiveFilter('All');
      setQuery('');
      
      Alert.alert('Success', '3 AI workouts generated successfully!');
    } catch (error) {
      const err = getApiErrorMessage(error);
      Alert.alert('Generation Failed', err);
      setErrorMessage(err);
    } finally {
      setIsGeneratingAi(false);
    }
  }, [profile]);

  const handleShowPresetWorkouts = useCallback(() => {
    setWorkoutView('presets');
  }, []);

  const handleShowGeneratedWorkouts = useCallback(() => {
    setWorkoutView('generated');
  }, []);

  const handleClearGeneratedWorkouts = useCallback(() => {
    if (generatedWorkoutCount === 0 || isClearingAi) {
      return;
    }

    setShowDeleteGeneratedPrompt(true);
  }, [generatedWorkoutCount, isClearingAi, refreshWorkouts]);

  const confirmClearGeneratedWorkouts = useCallback(async () => {
    setShowDeleteGeneratedPrompt(false);
    setIsClearingAi(true);

    try {
      await clearGeneratedAiWorkouts();
      setWorkoutView('presets');
      await refreshWorkouts();
    } catch (error) {
      Alert.alert('Delete failed', getApiErrorMessage(error));
    } finally {
      setIsClearingAi(false);
    }
  }, [refreshWorkouts]);

  const confirmDeleteSelected = useCallback(async () => {
    setShowDeleteSelectedPrompt(false);
    if (selectedIds.size === 0) return;
    setIsClearingAi(true);

    try {
      // Delete on server
      await Promise.all(
        Array.from(selectedIds).map(async (id) => {
          try {
            await deleteWorkout(id);
          } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
              return;
            }
            throw error;
          }
        }),
      );

      // Refresh UI
      await refreshWorkouts();
      setSelectedIds(new Set());
      setIsSelecting(false);
    } catch (error) {
      Alert.alert('Delete failed', getApiErrorMessage(error));
    } finally {
      setIsClearingAi(false);
    }
  }, [selectedIds, refreshWorkouts]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      (async () => {
        try {
          const favorites = await listFavorites();
          if (!isMounted) {
            return;
          }

          setFavoriteIds(new Set(favorites.map((item) => item.id)));
        } catch (error) {
          if (!isMounted) {
            return;
          }

          // Keep explore usable for guests even when favorites are unauthorized.
          if (error instanceof ApiError && error.status === 401) {
            setFavoriteIds(new Set());
          }
        }
      })();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const selectedWorkoutId = selectedRoutine ? String(selectedRoutine.id) : null;
  const selectedIsFavorite = useMemo(() => {
    if (!selectedWorkoutId) {
      return false;
    }

    return favoriteIds.has(selectedWorkoutId);
  }, [favoriteIds, selectedWorkoutId]);

  const handleToggleFavorite = useCallback(async () => {
    if (!selectedWorkoutId || isFavoriteLoading) {
      return;
    }

    const wasFavorite = favoriteIds.has(selectedWorkoutId);

    await performToggleFavorite(selectedWorkoutId, wasFavorite);
  }, [favoriteIds, isFavoriteLoading, router, selectedWorkoutId]);

  const performToggleFavorite = useCallback(async (workoutId: string, removing: boolean) => {
    setIsFavoriteLoading(true);
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (removing) {
        next.delete(workoutId);
      } else {
        next.add(workoutId);
      }
      return next;
    });

    try {
      if (removing) {
        await removeFavorite(workoutId);
      } else {
        await addFavorite(workoutId);
      }
    } catch (error) {
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (removing) {
          next.add(workoutId);
        } else {
          next.delete(workoutId);
        }
        return next;
      });

      if (error instanceof ApiError && error.status === 401) {
        Alert.alert('Login required', 'Please log in to save favorites.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') },
        ]);
        return;
      }

      Alert.alert('Favorites error', getApiErrorMessage(error));
    } finally {
      setIsFavoriteLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.browseTitle}>Discover Workouts</Text>
        <Text style={styles.browseSubtitle}>Search routines and narrow by intensity.</Text>

        <TouchableOpacity 
          style={[styles.aiBanner, isGeneratingAi && styles.aiBannerDisabled]} 
          onPress={handleAiLaunch} 
          activeOpacity={0.9}
          disabled={isGeneratingAi}
        >
          <View style={styles.aiBannerTextWrap}>
            <Text style={styles.aiBannerTitle}>{aiPreset.title}</Text>
            <Text style={styles.aiBannerSubtitle}>{aiPreset.subtitle}</Text>
          </View>
          <Text style={styles.aiBannerAction}>{isGeneratingAi ? 'Generating...' : 'Generate'}</Text>
        </TouchableOpacity>

        <View style={styles.viewSwitcherRow}>
          <TouchableOpacity
            style={[styles.viewSwitchChip, workoutView === 'presets' && styles.viewSwitchChipActive]}
            onPress={handleShowPresetWorkouts}
          >
            <Text style={[styles.viewSwitchText, workoutView === 'presets' && styles.viewSwitchTextActive]}>Preset workouts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewSwitchChip, workoutView === 'generated' && styles.viewSwitchChipActive]}
            onPress={handleShowGeneratedWorkouts}
            disabled={generatedWorkoutCount === 0}
          >
            <Text style={[styles.viewSwitchText, workoutView === 'generated' && styles.viewSwitchTextActive, generatedWorkoutCount === 0 && styles.viewSwitchTextDisabled]}>
              AI workouts{generatedWorkoutCount > 0 ? ` (${generatedWorkoutCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* moved delete/select controls into the section header */}

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
          <View style={styles.sectionActions}>
            {workoutView === 'generated' && generatedWorkoutCount > 0 && !isSelecting && (
              <TouchableOpacity
                onPress={() => setIsSelecting(true)}
                style={styles.binButton}
                accessibilityLabel="Delete AI workouts"
              >
                <Image source={require('@/assets/images/bin.png')} style={styles.binIcon} contentFit="contain" />
              </TouchableOpacity>
            )}
            {workoutView === 'generated' && isSelecting && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    const genIds = workouts.slice(0, generatedWorkoutCount).map((w) => String(w.id));
                    if (selectedIds.size === genIds.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(genIds));
                    }
                  }}
                  style={styles.selectAllButton}
                >
                  <Text style={styles.selectAllText}>
                    {selectedIds.size === Math.min(generatedWorkoutCount, workouts.length) ? 'None' : 'All'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowDeleteSelectedPrompt(true)}
                  disabled={selectedIds.size === 0 || isClearingAi}
                  style={[styles.deleteSelectedButton, selectedIds.size === 0 && styles.deleteSelectedDisabled]}
                >
                  <Text style={styles.deleteSelectedText}>
                    {isClearingAi ? '...' : selectedIds.size > 0 ? `Delete (${selectedIds.size})` : 'Delete'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setIsSelecting(false); setSelectedIds(new Set()); }} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>✕</Text>
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.sectionMeta}>{workouts.length} items</Text>
          </View>
        </View>

        {isLoading ? <Text style={styles.statusText}>Loading workouts...</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.cardList}>
          {workouts.map((item, idx) => {
            const isGeneratedItem = idx < generatedWorkoutCount && workoutView === 'generated';
            return (
              <View key={item.id} style={isGeneratedItem && isSelecting ? styles.cardRow : undefined}>
                {isGeneratedItem && isSelecting ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(String(item.id))) {
                          next.delete(String(item.id));
                        } else {
                          next.add(String(item.id));
                        }
                        return next;
                      });
                    }}
                    style={[styles.checkbox, selectedIds.has(String(item.id)) && styles.checkboxChecked]}
                    accessibilityLabel={`Select ${item.title}`}
                  />
                ) : null}

                <Card
                  title={item.title}
                  subtitle={item.subtitle}
                  duration={item.duration}
                  badges={item.intensity ? [item.intensity] : []}
                  coverImage={resolveWorkoutImage(item)}
                  onPress={() => {
                    if (isGeneratedItem && isSelecting) {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(String(item.id))) {
                          next.delete(String(item.id));
                        } else {
                          next.add(String(item.id));
                        }
                        return next;
                      });
                      return;
                    }

                    setSelectedRoutine(item);
                    setModalVisible(true);
                  }}
                  accessibilityLabel={`Open ${item.title} routine details`}
                />
              </View>
            );
          })}

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
        routine={selectedRoutine ? {
          ...selectedRoutine,
          coverImage: resolveWorkoutImage(selectedRoutine),
        } : null}
        isFavorite={selectedIsFavorite}
        isFavoriteLoading={isFavoriteLoading}
        onToggleFavorite={handleToggleFavorite}
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

      <ConfirmationModal
        visible={showAiPrompt}
        title="Generate AI Workout?"
        message={`Generate a new AI workout based on your ${profile.activityLevel.trim() || 'activity level'} and ${profile.workout.trim() || 'workout'} preferences.`}
        confirmText="Generate"
        cancelText="Cancel"
        onConfirm={handleAiConfirm}
        onCancel={() => setShowAiPrompt(false)}
      />

      <ConfirmationModal
        visible={showDeleteGeneratedPrompt}
        title="Delete AI workouts?"
        message="This removes the previously generated routines from the server."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmClearGeneratedWorkouts}
        onCancel={() => setShowDeleteGeneratedPrompt(false)}
        isDangerous
      />

      <ConfirmationModal
        visible={showDeleteSelectedPrompt}
        title="Delete selected AI workouts?"
        message="This will remove the selected AI-generated routines from the server."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteSelected}
        onCancel={() => setShowDeleteSelectedPrompt(false)}
        isDangerous
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
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: UiTheme.spacing.sm,
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    borderWidth: 1,
    borderColor: UiTheme.colors.accent,
    padding: UiTheme.spacing.md,
  },
  aiBannerTextWrap: {
    flex: 1,
    gap: 2,
  },
  aiBannerTitle: {
    color: UiTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  aiBannerSubtitle: {
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.body,
  },
  aiBannerAction: {
    color: UiTheme.colors.accent,
    fontWeight: '900',
  },
  viewSwitcherRow: {
    flexDirection: 'row',
    gap: UiTheme.spacing.xs,
  },
  viewSwitchChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: UiTheme.radius.xl,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    backgroundColor: UiTheme.colors.surface,
    paddingHorizontal: UiTheme.spacing.md,
  },
  viewSwitchChipActive: {
    borderColor: UiTheme.colors.accent,
    backgroundColor: UiTheme.colors.accentSoft,
  },
  viewSwitchText: {
    color: UiTheme.colors.textSecondary,
    fontWeight: '800',
    fontSize: UiTheme.font.caption,
  },
  viewSwitchTextActive: {
    color: UiTheme.colors.accent,
  },
  viewSwitchTextDisabled: {
    opacity: 0.45,
  },
  deleteAiButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  deleteAiButtonDisabled: {
    opacity: 0.45,
  },
  deleteAiButtonText: {
    color: UiTheme.colors.danger,
    fontWeight: '800',
    fontSize: UiTheme.font.caption,
  },
  aiBannerDisabled: {
    opacity: 0.6,
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
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: UiTheme.spacing.sm },
  binButton: { padding: UiTheme.spacing.xs },
  binIcon: { width: 20, height: 20 },
  selectAllButton: { paddingVertical: UiTheme.spacing.xs, paddingHorizontal: UiTheme.spacing.sm, borderRadius: UiTheme.radius.md, backgroundColor: UiTheme.colors.surfaceMuted },
  selectAllText: { color: UiTheme.colors.textPrimary, fontWeight: '700', fontSize: 12 },
  deleteSelectedButton: { paddingVertical: UiTheme.spacing.xs, paddingHorizontal: UiTheme.spacing.sm, borderRadius: UiTheme.radius.md, backgroundColor: UiTheme.colors.danger },
  deleteSelectedDisabled: { backgroundColor: UiTheme.colors.surfaceMuted },
  deleteSelectedText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cancelButton: { padding: UiTheme.spacing.xs },
  cancelText: { color: UiTheme.colors.textSecondary, fontSize: 18, fontWeight: '700' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: UiTheme.spacing.sm },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: UiTheme.colors.border, backgroundColor: UiTheme.colors.surface, marginTop: 8 },
  checkboxChecked: { backgroundColor: UiTheme.colors.accent, borderColor: UiTheme.colors.accent },
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
