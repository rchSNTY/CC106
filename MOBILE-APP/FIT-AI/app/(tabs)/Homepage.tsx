import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { ApiError, getApiErrorMessage, listHistory } from '@/services/backend';
import { useUserProfile } from '@/stores/user-profile';
import { getTotalWorkoutMinutes, getWeeklyCompletedWorkouts, getWorkoutStreakDays } from '@/utils/history-stats';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Homepage(): JSX.Element {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [history, setHistory] = useState<Array<{ date: string; duration: string }>>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      setStatsError(null);
      const nextHistory = await listHistory();
      setHistory(nextHistory);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setHistory([]);
        setStatsError(null);
        return;
      }

      setHistory([]);
      setStatsError(getApiErrorMessage(error));
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  const weeklyCompleted = useMemo(() => getWeeklyCompletedWorkouts(history), [history]);
  const totalMinutes = useMemo(() => getTotalWorkoutMinutes(history), [history]);
  const streakDays = useMemo(() => getWorkoutStreakDays(history), [history]);

  const displayName = profile.name.trim() ? profile.name.trim() : 'User';
  const weeklyGoalTarget = Number.isFinite(profile.weeklyGoal) && profile.weeklyGoal > 0 ? profile.weeklyGoal : 5;
  const activityLevel = profile.activityLevel.trim() ? profile.activityLevel.trim() : 'Moderate';

  const workoutFocus = useMemo(() => {
    const workoutType = profile.workout.trim();

    if (!workoutType) {
      return `${activityLevel} full-body routine`;
    }

    const normalized = workoutType.toLowerCase();
    if (normalized === 'cardio') {
      return `${activityLevel} cardio endurance`;
    }

    if (normalized === 'bodyweight') {
      return `${activityLevel} bodyweight strength`;
    }

    if (normalized === 'weight') {
      return `${activityLevel} resistance training`;
    }

    return `${activityLevel} ${workoutType}`;
  }, [activityLevel, profile.workout]);

  const stats = useMemo(
    () => [
      { label: 'Weekly Goal', value: isStatsLoading ? '...' : `${weeklyCompleted} / ${weeklyGoalTarget}` },
      { label: 'Minutes', value: isStatsLoading ? '...' : `${totalMinutes}` },
      { label: 'Streak', value: isStatsLoading ? '...' : `${streakDays} ${streakDays === 1 ? 'day' : 'days'}` },
    ],
    [isStatsLoading, streakDays, totalMinutes, weeklyCompleted, weeklyGoalTarget],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />
          <View>
            <Text style={styles.kicker}>FIT AI</Text>
            <Text style={styles.welcomeText}>Welcome back, {displayName}</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Workout Focus</Text>
          <Text style={styles.heroSubtitle}>{workoutFocus}</Text>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.primaryAction} onPress={() => router.push('/choices' as Href)}>
              <Text style={styles.primaryActionText}>Change Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/Log' as Href)}>
              <Text style={styles.secondaryActionText}>View Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>
        {statsError ? <Text style={styles.statsErrorText}>{statsError}</Text> : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Launch</Text>
        </View>

        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/explore' as Href)}>
            <Text style={styles.quickTitle}>Explore Workouts</Text>
            <Text style={styles.quickSubtitle}>Find routines by intensity and style.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/Favorites' as Href)}>
            <Text style={styles.quickTitle}>Your Favorites</Text>
            <Text style={styles.quickSubtitle}>Open your saved workout shortcuts.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabNav activeTab="Homepage" />
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
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: UiTheme.spacing.sm,
    marginTop: UiTheme.spacing.xl,
  },
  logo: { width: 44, height: 44, borderRadius: UiTheme.radius.sm },
  kicker: {
    fontSize: UiTheme.font.caption,
    color: UiTheme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  welcomeText: { fontSize: UiTheme.font.subtitle, color: UiTheme.colors.textPrimary, fontWeight: '800' },
  heroCard: {
    backgroundColor: UiTheme.colors.surface,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    borderRadius: UiTheme.radius.lg,
    padding: UiTheme.spacing.lg,
    gap: UiTheme.spacing.sm,
  },
  heroTitle: { color: UiTheme.colors.textSecondary, fontWeight: '700', fontSize: UiTheme.font.body },
  heroSubtitle: { color: UiTheme.colors.textPrimary, fontWeight: '800', fontSize: UiTheme.font.subtitle },
  heroActions: { flexDirection: 'row', gap: UiTheme.spacing.sm, marginTop: UiTheme.spacing.xs },
  primaryAction: {
    flex: 1,
    backgroundColor: UiTheme.colors.accent,
    borderRadius: UiTheme.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: { color: UiTheme.colors.surface, fontWeight: '800' },
  secondaryAction: {
    flex: 1,
    backgroundColor: UiTheme.colors.surfaceMuted,
    borderRadius: UiTheme.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
  },
  secondaryActionText: { color: UiTheme.colors.textPrimary, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: UiTheme.spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.md,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    paddingVertical: UiTheme.spacing.md,
    paddingHorizontal: UiTheme.spacing.sm,
    alignItems: 'center',
  },
  statLabel: { color: UiTheme.colors.textSecondary, fontWeight: '600', fontSize: UiTheme.font.caption },
  statValue: { color: UiTheme.colors.textPrimary, fontWeight: '800', fontSize: 16 },
  statsErrorText: { color: '#b91c1c', fontSize: UiTheme.font.caption, marginTop: 2 },
  sectionHeader: { marginTop: UiTheme.spacing.xs },
  sectionTitle: { fontSize: UiTheme.font.subtitle, fontWeight: '800', color: UiTheme.colors.textPrimary },
  quickGrid: { gap: UiTheme.spacing.sm },
  quickCard: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    padding: UiTheme.spacing.md,
    gap: UiTheme.spacing.xs,
  },
  quickTitle: { fontSize: 16, fontWeight: '800', color: UiTheme.colors.textPrimary },
  quickSubtitle: { fontSize: UiTheme.font.body, color: UiTheme.colors.textSecondary },
});
