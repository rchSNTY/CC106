import { Card } from '@/components/Card';
import RoutineDetailsModal, { type Routine } from '@/components/RoutineDetailsModal';
import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { getApiErrorMessage, listHistory, listWorkouts } from '@/services/backend';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HistoryRoutine = Routine & {
  date: string;
};

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DONE_DAYS = new Set<number>([0, 1, 3]);

export default function Log(): JSX.Element {
  const router = useRouter();
  const [historyWorkouts, setHistoryWorkouts] = useState<HistoryRoutine[]>([]);
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
        const [history, workouts] = await Promise.all([listHistory(), listWorkouts('All', '')]);

        if (!isMounted) {
          return;
        }

        const byId = new Map(workouts.map((workout) => [workout.id, workout]));
        const merged = history
          .map((item) => {
            const workout = byId.get(item.workoutId);
            if (!workout) {
              return null;
            }

            return {
              ...workout,
              date: item.date,
              intensity: item.intensity,
              duration: item.duration,
            } as HistoryRoutine;
          })
          .filter((item): item is HistoryRoutine => Boolean(item));

        setHistoryWorkouts(merged);
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
  }, []);

  const workouts = historyWorkouts.length;
  const totalMinutes = historyWorkouts.reduce((sum, item) => sum + parseInt(item.duration, 10), 0);
  const averageMinutes = useMemo(() => {
    if (workouts === 0) {
      return 0;
    }
    return Math.round(totalMinutes / workouts);
  }, [totalMinutes, workouts]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />
            <View>
              <Text style={styles.brandName}>FITBUD</Text>
              <Text style={styles.brandSub}>Activity Journal</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Activity Log</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Workouts</Text>
            <Text style={styles.statValue}>{workouts}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Minutes</Text>
            <Text style={styles.statValue}>{totalMinutes}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Session</Text>
            <Text style={styles.statValue}>{averageMinutes}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Streak</Text>
          <View style={styles.streakRow}>
            {WEEK_DAYS.map((day, index) => {
              const done = DONE_DAYS.has(index);

              return (
                <View key={`${day}-${index}`} style={[styles.dayCircle, done ? styles.dayDone : styles.dayIdle]}>
                  <Text style={[styles.dayText, done ? styles.dayTextDone : styles.dayTextIdle]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout History</Text>
          {isLoading ? <Text style={styles.statusText}>Loading workout history...</Text> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <View style={styles.historyList}>
            {historyWorkouts.map((item, index) => (
              <Card
                key={`${item.id}-${index}`}
                title={item.title}
                subtitle={item.date}
                duration={item.duration}
                badges={[item.intensity ?? 'Past']}
                onPress={() => {
                  setSelectedRoutine(item);
                  setModalVisible(true);
                }}
                accessibilityLabel={`Open ${item.title} workout details`}
              />
            ))}
            {!isLoading && !errorMessage && historyWorkouts.length === 0 ? <Text style={styles.statusText}>No history yet. Start a workout to track your progress.</Text> : null}
          </View>
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

      <BottomTabNav activeTab="Log" />
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
  topRow: {
    marginTop: UiTheme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: UiTheme.spacing.sm },
  logo: { width: 44, height: 44 },
  brandName: { fontSize: 18, fontWeight: '900', color: UiTheme.colors.textPrimary, letterSpacing: 0.5 },
  brandSub: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
  backText: { color: UiTheme.colors.accent, fontSize: UiTheme.font.body, fontWeight: '800' },
  pageTitle: { color: UiTheme.colors.textPrimary, fontSize: 28, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', gap: UiTheme.spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: UiTheme.colors.surface,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    borderRadius: UiTheme.radius.md,
    paddingVertical: UiTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
  statValue: { color: UiTheme.colors.textPrimary, fontSize: 18, fontWeight: '900' },
  section: { gap: UiTheme.spacing.sm },
  sectionTitle: { color: UiTheme.colors.textPrimary, fontSize: UiTheme.font.subtitle, fontWeight: '800' },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  dayDone: { backgroundColor: UiTheme.colors.accentSoft, borderWidth: 1, borderColor: UiTheme.colors.accent },
  dayIdle: { backgroundColor: UiTheme.colors.surface, borderWidth: 1, borderColor: UiTheme.colors.border },
  dayText: { fontWeight: '800', fontSize: UiTheme.font.caption },
  dayTextDone: { color: UiTheme.colors.accent },
  dayTextIdle: { color: UiTheme.colors.textSecondary },
  historyList: { gap: UiTheme.spacing.sm },
  historyCard: {
    backgroundColor: UiTheme.colors.surface,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    borderRadius: UiTheme.radius.lg,
    padding: UiTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
  historyTitle: { color: UiTheme.colors.textPrimary, fontSize: 16, fontWeight: '800' },
  historyDuration: { color: UiTheme.colors.textSecondary, fontWeight: '800', fontSize: UiTheme.font.body },
  statusText: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body, fontWeight: '600' },
  errorText: { color: UiTheme.colors.danger, fontSize: UiTheme.font.body, fontWeight: '600' },
});
