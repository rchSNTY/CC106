import { Card } from '@/components/Card';
import RoutineDetailsModal, { type Routine } from '@/components/RoutineDetailsModal';
import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { ApiError, addFavorite, getApiErrorMessage, listFavorites, removeFavorite } from '@/services/backend';
import { resolveWorkoutImage } from '@/utils/imageResolution';
import { useFocusEffect } from '@react-navigation/native';
import { Href, useRouter } from 'expo-router';
import React, { JSX, useCallback, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Favorites(): JSX.Element {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const loadFavorites = useCallback(async (isMountedRef: () => boolean) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const result = await listFavorites();
      if (!isMountedRef()) {
        return;
      }
      setFavorites(
        result.map((item) => ({
          ...item,
          exercises: item.exercises.map((exercise) => ({ ...exercise, steps: (exercise as any).steps ?? [] })),
        })),
      );
    } catch (error) {
      if (!isMountedRef()) {
        return;
      }
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      if (isMountedRef()) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      void loadFavorites(() => isMounted);

      return () => {
        isMounted = false;
      };
    }, [loadFavorites]),
  );

  const selectedWorkoutId = selectedRoutine ? String(selectedRoutine.id) : null;
  const selectedIsFavorite = useMemo(() => {
    if (!selectedWorkoutId) {
      return false;
    }

    return favorites.some((fav) => String(fav.id) === selectedWorkoutId);
  }, [favorites, selectedWorkoutId]);

  const handleToggleFavorite = useCallback(async () => {
    if (!selectedWorkoutId || isFavoriteLoading) {
      return;
    }

    const wasFavorite = selectedIsFavorite;

    await performToggleFavorite(selectedWorkoutId, wasFavorite);
  }, [favorites, isFavoriteLoading, router, selectedRoutine, selectedIsFavorite, selectedWorkoutId]);

  const performToggleFavorite = useCallback(async (workoutId: string, removing: boolean) => {
    setIsFavoriteLoading(true);
    setFavorites((current) => {
      if (removing) {
        return current.filter((fav) => String(fav.id) !== workoutId);
      } else if (selectedRoutine) {
        return [...current, selectedRoutine];
      }
      return current;
    });

    try {
      if (removing) {
        await removeFavorite(workoutId);
      } else {
        await addFavorite(workoutId);
      }
    } catch (error) {
      setFavorites((current) => {
        if (removing && selectedRoutine) {
          return [...current, selectedRoutine];
        } else {
          return current.filter((fav) => String(fav.id) !== workoutId);
        }
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
  }, [selectedRoutine]);

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

        {isLoading ? <Text style={styles.statusText}>Loading favorites...</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.list}>
          {favorites.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              duration={item.duration}
              badges={item.intensity ? [item.intensity] : []}
              coverImage={resolveWorkoutImage(item)}
              onPress={() => {
                setSelectedRoutine(item);
                setModalVisible(true);
              }}
              accessibilityLabel={`Open ${item.title} routine details`}
            />
          ))}
        </View>

        {!isLoading && !errorMessage && favorites.length === 0 ? <View style={styles.emptyHintCard}>
          <Text style={styles.emptyHintTitle}>Want more personalization?</Text>
          <Text style={styles.emptyHintSubtitle}>Open Explore and save workouts based on your activity level.</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/explore' as Href)}>
            <Text style={styles.ctaText}>Go to Explore</Text>
          </TouchableOpacity>
        </View> : null}
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
  statusText: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body, fontWeight: '600' },
  errorText: { color: UiTheme.colors.danger, fontSize: UiTheme.font.body, fontWeight: '600' },
});
