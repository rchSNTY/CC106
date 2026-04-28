import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';
import { getApiErrorMessage, createHistoryEntry } from '@/services/backend';
import { ConfirmationModal } from '@/components/confirmation-modal';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { type Routine, type RoutineExercise } from '@/components/RoutineDetailsModal';

export default function ActiveWorkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Parse routine from params
  useEffect(() => {
    if (params.routine) {
      try {
        const parsed = JSON.parse(params.routine as string);
        setRoutine(parsed);
      } catch (e) {
        console.error('Failed to parse routine:', e);
      }
    }
  }, [params.routine]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && routine) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, routine]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  };

  const currentExercise = routine?.exercises[currentIndex];

  const handleNext = () => {
    if (routine && currentIndex < routine.exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = async () => {
    if (!routine) return;

    try {
      // Try to save to history (may fail if not logged in, which is fine)
      await createHistoryEntry({
        workoutId: routine.id as string,
        title: routine.title,
        date: formatDate(),
        duration: formatTime(elapsedTime),
        intensity: routine.intensity || 'Moderate',
        completed: true,
      });
    } catch (error) {
      console.log('Could not save to history (user may not be logged in):', getApiErrorMessage(error));
    }

    router.replace('/Log');
  };

  const handleSkip = () => {
    if (routine && currentIndex < routine.exercises.length - 1) {
      handleNext();
    } else {
      setShowCompleteModal(true);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    router.replace('/Log');
  };

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading workout...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <ThemedText style={styles.cancelText}>✕</ThemedText>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText type="defaultSemiBold" style={styles.routineTitle}>
            {routine.title}
          </ThemedText>
          <ThemedText style={styles.timer}>{formatTime(elapsedTime)}</ThemedText>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / routine.exercises.length) * 100}%` }]} />
        </View>
        <ThemedText style={styles.progressText}>
          Exercise {currentIndex + 1} of {routine.exercises.length}
        </ThemedText>
      </View>

      {/* Exercise Card */}
      <View style={styles.exerciseContainer}>
        <View style={styles.exerciseCard}>
          <ThemedText type="title" style={styles.exerciseName}>
            {currentExercise?.name}
          </ThemedText>
          {currentExercise?.reps && (
            <View style={styles.repsContainer}>
              <ThemedText style={styles.repsLabel}>REPS</ThemedText>
              <ThemedText style={styles.repsValue}>{currentExercise.reps}</ThemedText>
            </View>
          )}
          <ThemedText style={styles.exerciseDetail}>{currentExercise?.detail}</ThemedText>
          {currentExercise?.equipment && (
            <View style={styles.equipmentContainer}>
              <ThemedText style={styles.equipmentLabel}>Equipment: </ThemedText>
              <ThemedText style={styles.equipmentValue}>{currentExercise.equipment}</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ThemedText style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
            ← Previous
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <ThemedText style={styles.skipButtonText}>
            {currentIndex === routine.exercises.length - 1 ? 'Finish' : 'Next →'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Complete Button */}
      <View style={styles.completeContainer}>
        <TouchableOpacity style={styles.completeButton} onPress={() => setShowCompleteModal(true)}>
          <ThemedText type="defaultSemiBold" style={styles.completeButtonText}>
            ✓ Complete Workout
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Workout?"
        message="Are you sure you want to exit? Your progress will not be saved."
        confirmText="Exit"
        cancelText="Keep Going"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
        isDangerous
      />

      {/* Complete Confirmation Modal */}
      <ConfirmationModal
        visible={showCompleteModal}
        title="Complete Workout?"
        message={`Great job completing "${routine.title}"!\n\nTime: ${formatTime(elapsedTime)}`}
        confirmText="Complete"
        cancelText="Continue"
        onConfirm={handleComplete}
        onCancel={() => setShowCompleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UiTheme.colors.page,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: UiTheme.spacing.lg,
    paddingVertical: UiTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: UiTheme.colors.border,
  },
  cancelButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 24,
    color: UiTheme.colors.textSecondary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  routineTitle: {
    fontSize: UiTheme.font.subtitle,
    color: UiTheme.colors.textPrimary,
  },
  timer: {
    fontSize: 32,
    fontWeight: '900',
    color: UiTheme.colors.accent,
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: UiTheme.spacing.lg,
    paddingVertical: UiTheme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: UiTheme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: UiTheme.colors.accent,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: UiTheme.spacing.sm,
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.caption,
    fontWeight: '700',
  },
  exerciseContainer: {
    flex: 1,
    paddingHorizontal: UiTheme.spacing.lg,
    justifyContent: 'center',
  },
  exerciseCard: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.xl,
    padding: UiTheme.spacing.xl,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '900',
    color: UiTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: UiTheme.spacing.md,
  },
  repsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UiTheme.colors.accent + '20',
    paddingHorizontal: UiTheme.spacing.lg,
    paddingVertical: UiTheme.spacing.sm,
    borderRadius: UiTheme.radius.lg,
    marginBottom: UiTheme.spacing.md,
  },
  repsLabel: {
    fontSize: UiTheme.font.caption,
    fontWeight: '800',
    color: UiTheme.colors.accent,
    marginRight: UiTheme.spacing.sm,
  },
  repsValue: {
    fontSize: 20,
    fontWeight: '900',
    color: UiTheme.colors.accent,
  },
  exerciseDetail: {
    fontSize: UiTheme.font.body,
    color: UiTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  equipmentContainer: {
    flexDirection: 'row',
    marginTop: UiTheme.spacing.md,
  },
  equipmentLabel: {
    fontSize: UiTheme.font.caption,
    color: UiTheme.colors.textSecondary,
  },
  equipmentValue: {
    fontSize: UiTheme.font.caption,
    fontWeight: '700',
    color: UiTheme.colors.accent,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: UiTheme.spacing.lg,
    paddingVertical: UiTheme.spacing.md,
    gap: UiTheme.spacing.md,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: UiTheme.spacing.lg,
    borderRadius: UiTheme.radius.lg,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: UiTheme.font.body,
    fontWeight: '700',
    color: UiTheme.colors.textPrimary,
  },
  navButtonTextDisabled: {
    color: UiTheme.colors.textSecondary,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: UiTheme.spacing.lg,
    borderRadius: UiTheme.radius.lg,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: UiTheme.font.body,
    fontWeight: '700',
    color: UiTheme.colors.textPrimary,
  },
  completeContainer: {
    paddingHorizontal: UiTheme.spacing.lg,
    paddingBottom: UiTheme.spacing.xl,
  },
  completeButton: {
    backgroundColor: UiTheme.colors.accent,
    borderRadius: UiTheme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: UiTheme.colors.surface,
    fontSize: UiTheme.font.body,
    fontWeight: '800',
  },
});