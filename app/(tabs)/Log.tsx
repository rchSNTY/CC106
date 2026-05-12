import { Card } from '@/components/Card';
import RoutineDetailsModal, { type Routine } from '@/components/RoutineDetailsModal';
import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { UiTheme } from '@/constants/ui-theme';
import { ApiError, addFavorite, getApiErrorMessage, listFavorites, listGeneratedAiWorkouts, listHistory, listWorkouts, removeFavorite } from '@/services/backend';
import { getAverageWorkoutMinutes, getCompletedWeekdayIndexesForCurrentWeek, getTotalWorkoutMinutes } from '@/utils/history-stats';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HistoryRoutine = Routine & {
  date: string;
};

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date: Date): Date {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
}

function addMonths(date: Date, amount: number): Date {
  const next = startOfMonth(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseHistoryDate(input: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }

  return parsed;
}

function getMonthGrid(cursor: Date): (Date | null)[] {
  const monthStart = startOfMonth(cursor);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const jsDay = monthStart.getDay(); // 0=Sun..6=Sat
  const mondayIndex = (jsDay + 6) % 7; // 0=Mon..6=Sun

  const cells: (Date | null)[] = [];
  for (let i = 0; i < mondayIndex; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function Log(): JSX.Element {
  const router = useRouter();
  const [historyWorkouts, setHistoryWorkouts] = useState<HistoryRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => startOfMonth(new Date()));

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const [history, workouts, generatedWorkouts] = await Promise.all([
          listHistory(),
          listWorkouts('All', ''),
          listGeneratedAiWorkouts().catch((error) => {
            if (error instanceof ApiError && error.status === 401) {
              return [];
            }

            throw error;
          }),
        ]);

        if (!isMounted) {
          return;
        }

        const byId = new Map([...workouts, ...generatedWorkouts].map((workout) => [workout.id, workout]));
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

        merged.sort((a, b) => b.date.localeCompare(a.date));
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
  }, [router]);

  const handleToggleFavorite = useCallback(async () => {
    if (!selectedWorkoutId || isFavoriteLoading) {
      return;
    }

    const wasFavorite = favoriteIds.has(selectedWorkoutId);

    await performToggleFavorite(selectedWorkoutId, wasFavorite);
  }, [favoriteIds, isFavoriteLoading, performToggleFavorite, selectedWorkoutId]);

  const workouts = historyWorkouts.length;
  const totalMinutes = useMemo(() => getTotalWorkoutMinutes(historyWorkouts), [historyWorkouts]);
  const averageMinutes = useMemo(() => getAverageWorkoutMinutes(historyWorkouts), [historyWorkouts]);
  const doneDays = useMemo(() => getCompletedWeekdayIndexesForCurrentWeek(historyWorkouts), [historyWorkouts]);

  const historyByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of historyWorkouts) {
      map.set(item.date, (map.get(item.date) ?? 0) + 1);
    }
    return map;
  }, [historyWorkouts]);

  const filteredHistoryWorkouts = useMemo(() => {
    if (!selectedDate) {
      return historyWorkouts;
    }

    return historyWorkouts.filter((item) => item.date === selectedDate);
  }, [historyWorkouts, selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const parsed = parseHistoryDate(selectedDate);
    if (parsed) {
      setCalendarMonth(startOfMonth(parsed));
    }
  }, [selectedDate]);

  const calendarTitle = useMemo(() => {
    const cursor = startOfMonth(calendarMonth);
    return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }, [calendarMonth]);

  const calendarCells = useMemo(() => getMonthGrid(calendarMonth), [calendarMonth]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={UiTheme.colors.page} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />
            <View>
              <Text style={styles.brandName}>FITBUD</Text>
              <Text style={styles.brandSub}>Activity Journal</Text>
            </View>
          </View>
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
              const done = doneDays.has(index);

              return (
                <View key={`${day}-${index}`} style={[styles.dayCircle, done ? styles.dayDone : styles.dayIdle]}>
                  <Text style={[styles.dayText, done ? styles.dayTextDone : styles.dayTextIdle]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionTitle}>Workout History</Text>
            {selectedDate ? (
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                accessibilityRole="button"
                accessibilityLabel="Clear date filter"
              >
                <Text style={styles.clearFilterText}>Show all</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity
                onPress={() => setCalendarMonth((current) => addMonths(current, -1))}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <Text style={styles.calendarNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{calendarTitle}</Text>
              <TouchableOpacity
                onPress={() => setCalendarMonth((current) => addMonths(current, 1))}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <Text style={styles.calendarNavText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekdays}>
              {WEEK_DAYS.map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.calendarWeekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.calendarCell} />;
                }

                const key = formatDateYYYYMMDD(date);
                const workoutsOnDay = historyByDate.get(key) ?? 0;
                const isSelected = selectedDate === key;
                const isToday = key === formatDateYYYYMMDD(new Date());
                const hasWorkout = workoutsOnDay > 0;

                return (
                  <Pressable
                    key={key}
                    style={({ pressed }) => [
                      styles.calendarCell,
                      hasWorkout && !isSelected && styles.calendarCellHasWorkout,
                      isSelected && styles.calendarCellSelected,
                      isToday && !isSelected && styles.calendarCellToday,
                    ]}
                    onPress={() => setSelectedDate(key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Show workouts for ${key}`}
                  >
                    <View style={styles.calendarCellInner}>
                      <Text
                        style={[
                          styles.calendarCellText,
                          {
                            color: isSelected
                              ? UiTheme.colors.accent
                              : UiTheme.colors.textPrimary,
                          },
                        ]}
                      >{date.getDate()}</Text>
                      {hasWorkout ? <View style={[styles.calendarDot, isSelected && styles.calendarDotSelected]} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {selectedDate ? <Text style={styles.calendarSelectedLabel}>Showing: {selectedDate}</Text> : <Text style={styles.calendarSelectedLabel}>Tap a date to filter.</Text>}
          </View>
          {isLoading ? <Text style={styles.statusText}>Loading workout history...</Text> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <View style={styles.historyList}>
            {filteredHistoryWorkouts.map((item, index) => (
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
            {!isLoading && !errorMessage && filteredHistoryWorkouts.length === 0 ? (
              <Text style={styles.statusText}>
                {selectedDate ? 'No workouts logged for this day yet.' : 'No history yet. Start a workout to track your progress.'}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <RoutineDetailsModal
        visible={modalVisible}
        routine={selectedRoutine}
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

      <BottomTabNav activeTab="Log" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UiTheme.colors.page, paddingTop: UiTheme.spacing.sm },
  container: {
    padding: UiTheme.spacing.lg,
    paddingBottom: UiTheme.nav.height + UiTheme.spacing.xl,
    gap: UiTheme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: UiTheme.spacing.sm },
  logo: { width: 44, height: 44 },
  brandName: { fontSize: 18, fontWeight: '900', color: UiTheme.colors.textPrimary, letterSpacing: 0.5 },
  brandSub: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
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
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearFilterText: { color: UiTheme.colors.accent, fontWeight: '800' },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  dayDone: { backgroundColor: UiTheme.colors.accentSoft, borderWidth: 1, borderColor: UiTheme.colors.accent },
  dayIdle: { backgroundColor: UiTheme.colors.surface, borderWidth: 1, borderColor: UiTheme.colors.border },
  dayText: { fontWeight: '800', fontSize: UiTheme.font.caption },
  dayTextDone: { color: UiTheme.colors.accent },
  dayTextIdle: { color: UiTheme.colors.textSecondary },
  calendarCard: {
    backgroundColor: UiTheme.colors.surface,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    borderRadius: UiTheme.radius.lg,
    padding: UiTheme.spacing.md,
    gap: UiTheme.spacing.sm,
  },
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calendarTitle: { color: UiTheme.colors.textPrimary, fontWeight: '900', fontSize: 16 },
  calendarNavText: { color: UiTheme.colors.accent, fontWeight: '900', fontSize: 22, paddingHorizontal: UiTheme.spacing.sm },
  calendarWeekdays: { flexDirection: 'row', justifyContent: 'space-between' },
  calendarWeekdayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: UiTheme.colors.textSecondary,
    fontWeight: '800',
    fontSize: UiTheme.font.caption,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: UiTheme.radius.md,
  },
  calendarCellInner: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  calendarCellHasWorkout: { backgroundColor: UiTheme.colors.surfaceMuted },
  calendarCellToday: { borderWidth: 1, borderColor: UiTheme.colors.accentSoft },
  calendarCellSelected: { backgroundColor: UiTheme.colors.accentSoft, borderWidth: 1, borderColor: UiTheme.colors.accent },
  calendarCellPressed: { backgroundColor: UiTheme.colors.accentSoft },
  calendarCellText: { color: UiTheme.colors.textPrimary, fontWeight: '800' },
  calendarCellTextSelected: { color: UiTheme.colors.accent },
  calendarDot: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UiTheme.colors.textSecondary,
    opacity: 0.7,
  },
  calendarDotSelected: { backgroundColor: UiTheme.colors.accent, opacity: 1 },
  calendarSelectedLabel: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
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
