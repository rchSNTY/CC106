import { Card } from '@/components/Card';
import { ConfirmationModal } from '@/components/confirmation-modal';
import RoutineDetailsModal, { type Routine } from '@/components/RoutineDetailsModal';
import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { Chip } from '@/components/ui/chip';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { UiTheme } from '@/constants/ui-theme';
import { ApiError, addFavorite, clearGeneratedAiWorkouts, deleteWorkout, generateAiWorkout, getApiErrorMessage, listFavorites, listGeneratedAiWorkouts, listWorkouts, removeFavorite } from '@/services/backend';
import { useExploreStore } from '@/stores/explore';
import { useSnackbar } from '@/stores/snackbar';
import { useUserProfile } from '@/stores/user-profile';
import { getAiWorkoutPreset } from '@/utils/ai-workout';
import { resolveWorkoutImage } from '@/utils/imageResolution';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Intensity = 'All' | 'Light' | 'Moderate' | 'Intense';

const FILTERS: Intensity[] = ['All', 'Light', 'Moderate', 'Intense'];

export default function Explore(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ ai?: string; intensity?: string; search?: string }>();
  const { profile } = useUserProfile();
  const { showSnackbar, hideSnackbar } = useSnackbar();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Intensity>('All');
  const workoutView = useExploreStore((state) => state.workoutView);
  const setWorkoutView = useExploreStore((state) => state.setWorkoutView);
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

      const presetPromise = workoutView === 'presets' ? listWorkouts(activeFilter, query) : Promise.resolve([]);

      let generatedWorkouts: Awaited<ReturnType<typeof listGeneratedAiWorkouts>> = [];
      try {
        generatedWorkouts = await listGeneratedAiWorkouts();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          generatedWorkouts = [];
        } else {
          throw error;
        }
      }

      const presetWorkouts = await presetPromise;

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

  useFocusEffect(
    useCallback(() => {
      void refreshWorkouts();
    }, [refreshWorkouts]),
  );

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
    showSnackbar({ message: 'Generating your workouts...', variant: 'info' });

    // Validate profile before sending
    if (!profile.name || !profile.name.trim()) {
      Alert.alert('Incomplete Profile', 'Please enter your name in your profile.');
      setIsGeneratingAi(false);
      hideSnackbar();
      return;
    }
    if (!profile.activityLevel || !profile.activityLevel.trim()) {
      Alert.alert('Incomplete Profile', 'Please select an activity level in your profile.');
      setIsGeneratingAi(false);
      hideSnackbar();
      return;
    }
    if (!profile.workout || !profile.workout.trim()) {
      Alert.alert('Incomplete Profile', 'Please select a workout type in your profile.');
      setIsGeneratingAi(false);
      hideSnackbar();
      return;
    }

    try {
      /*console.log('Sending AI generation request with profile:', {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        activityLevel: profile.activityLevel,
        workout: profile.workout,
        weeklyGoal: profile.weeklyGoal,
      });            
      keep this, in case of debugging*/ 

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

      setGeneratedWorkoutCount(routines.length);
      setWorkoutView('generated');
      setWorkouts(routines);
      setActiveFilter('All');
      setQuery('');
      setIsSelecting(false);
      setSelectedIds(new Set());

      showSnackbar({
        message: 'AI workouts ready.',
        variant: 'success',
        actionLabel: routines.length > 0 ? 'View' : undefined,
        onAction: routines.length > 0 ? () => {
          setSelectedRoutine(routines[0]);
          setModalVisible(true);
        } : undefined,
        autoDismissMs: 4500,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        hideSnackbar();
        Alert.alert('Login required', 'Please log in to generate AI workouts.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') },
        ]);
        return;
      }

      const err = getApiErrorMessage(error);
      setErrorMessage(err);
      showSnackbar({
        message: `Generation failed. ${err}`,
        variant: 'error',
        actionLabel: 'Retry',
        onAction: () => setShowAiPrompt(true),
        autoDismissMs: 7000,
      });
    } finally {
      setIsGeneratingAi(false);
    }
  }, [hideSnackbar, profile, router, showSnackbar]);

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
      if (error instanceof ApiError && error.status === 401) {
        Alert.alert('Login required', 'Please log in to manage AI workouts.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') },
        ]);
        return;
      }
      Alert.alert('Delete failed', getApiErrorMessage(error));
    } finally {
      setIsClearingAi(false);
    }
  }, [refreshWorkouts, router]);

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
      if (error instanceof ApiError && error.status === 401) {
        Alert.alert('Login required', 'Please log in to manage AI workouts.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') },
        ]);
        return;
      }
      Alert.alert('Delete failed', getApiErrorMessage(error));
    } finally {
      setIsClearingAi(false);
    }
  }, [router, selectedIds, refreshWorkouts]);

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
      <StatusBar barStyle="dark-content" backgroundColor={UiTheme.colors.page} />

      {/* Fixed Header Section - Not Scrollable */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.browseTitle}>Discover Workouts</Text>
            <Text style={styles.browseSubtitle}>Search routines and narrow by intensity.</Text>
          </View>

          <View style={styles.viewSwitcherTopRight}>
            <SegmentedControl
              value={workoutView}
              options={[
                { key: 'presets', label: 'Presets' },
                { key: 'generated', label: generatedWorkoutCount > 0 ? `AI` : 'AI' },
              ]}
              onChange={(next) => {
                if (next === 'presets') {
                  handleShowPresetWorkouts();
                } else {
                  handleShowGeneratedWorkouts();
                }
              }}
            />
          </View>
        </View>

        {workoutView === 'generated' ? (
          <TouchableOpacity 
            style={[styles.aiBanner, isGeneratingAi && styles.aiBannerDisabled]} 
            onPress={handleAiLaunch} 
            activeOpacity={0.9}
            disabled={isGeneratingAi}
          >
            <View style={styles.aiBannerTextWrap}>
              <Text style={styles.aiBannerTitle}>{aiPreset.title}</Text>
              <Text style={styles.aiBannerSubtitle}>{isGeneratingAi ? 'Creating workouts based on your profile...' : aiPreset.subtitle}</Text>
            </View>
            <View style={styles.aiBannerActionWrap}>
              {isGeneratingAi ? <ActivityIndicator size="small" color={UiTheme.colors.accent} /> : null}
              <Text style={styles.aiBannerAction}>{isGeneratingAi ? 'Generating...' : 'Generate'}</Text>
            </View>
          </TouchableOpacity>
        ) : null}

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
          {FILTERS.map((filter) => (
            <Chip key={filter} label={filter} selected={filter === activeFilter} onPress={() => setActiveFilter(filter)} />
          ))}
        </View>
      </View>

      {/* Results header should stay fixed while list scrolls */}
      <View style={styles.resultsHeaderContainer}>
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
                  <Text style={styles.cancelText}>{'\u2715'}</Text>
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.sectionMeta}>{workouts.length} items</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.resultsScroll} contentContainerStyle={styles.resultsContainer} showsVerticalScrollIndicator={false}>

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

                <View style={isGeneratedItem && isSelecting ? styles.cardWrapper : undefined}>
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
              </View>
            );
          })}

          {!isLoading && !errorMessage && workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{workoutView === 'generated' ? 'No AI workouts yet' : 'No workouts found'}</Text>
              <Text style={styles.emptySubtitle}>
                {workoutView === 'generated' ? 'Tap Generate above to create one.' : 'Try another search keyword or switch filter.'}
              </Text>
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
  headerContainer: {
    paddingHorizontal: UiTheme.spacing.lg,
    gap: UiTheme.spacing.md,
  },
  headerTopRow: {
    paddingTop: UiTheme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: UiTheme.spacing.md,
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  viewSwitcherTopRight: {
    alignSelf: 'flex-start',
    width: 140,
  },
  resultsHeaderContainer: {
    paddingHorizontal: UiTheme.spacing.lg,
    paddingTop: UiTheme.spacing.lg,
    paddingBottom: UiTheme.spacing.md,
  },
  resultsScroll: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: UiTheme.spacing.lg,
    paddingTop: UiTheme.spacing.md,
    paddingBottom: UiTheme.nav.height + UiTheme.spacing.xl,
    gap: UiTheme.spacing.md,
  },
  browseTitle: {
    fontSize: UiTheme.font.title,
    fontWeight: '800',
    color: UiTheme.colors.textPrimary,
  },
  browseSubtitle: {
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.body,
    paddingTop: 4,
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
  aiBannerActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UiTheme.spacing.xs,
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
  cardWrapper: { flex: 1 },
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
