import React from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

export type RoutineExercise = {
  id: number | string;
  name: string;
  detail: string;
  reps?: string;
  equipment?: string;
};

export type Routine = {
  id: number | string;
  title: string;
  subtitle?: string;
  duration: string;
  intensity?: string;
  exercises: RoutineExercise[];
};

type RoutineDetailsModalProps = {
  visible: boolean;
  routine: Routine | null;
  onClose: () => void;
  onStart?: () => void;
};

export default function RoutineDetailsModal({ visible, routine, onClose, onStart }: RoutineDetailsModalProps) {
  if (!visible || !routine) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.inner}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextGroup}>
                <ThemedText type="title" style={styles.title}>{routine.title}</ThemedText>
                <View style={styles.metaRow}>
                  <ThemedText style={styles.metaText}>{routine.duration}</ThemedText>
                  <ThemedText style={styles.metaSeparator}>·</ThemedText>
                  <ThemedText style={styles.metaText}>{routine.exercises.length} exercises</ThemedText>
                </View>
                {routine.subtitle ? <ThemedText style={styles.subtitle}>{routine.subtitle}</ThemedText> : null}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <ThemedText style={styles.closeText}>Close</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Routine Summary</ThemedText>
                <ThemedText style={styles.sectionText}>This routine contains AI-generated exercise guidance for your current plan.</ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Exercises</ThemedText>
                {routine.exercises.map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                      {exercise.reps ? <ThemedText style={styles.exerciseReps}>{exercise.reps}</ThemedText> : null}
                    </View>
                    <ThemedText style={styles.exerciseDetail}>{exercise.detail}</ThemedText>
                    {exercise.equipment ? <ThemedText style={styles.exerciseEquipment}>{exercise.equipment}</ThemedText> : null}
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.startButton} onPress={onStart ?? onClose}>
              <ThemedText type="defaultSemiBold" style={styles.startButtonText}>Start Routine</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 51, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: UiTheme.colors.page,
    borderTopLeftRadius: UiTheme.radius.xl,
    borderTopRightRadius: UiTheme.radius.xl,
    maxHeight: '90%',
    paddingTop: UiTheme.spacing.lg,
    paddingBottom: UiTheme.spacing.lg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: UiTheme.spacing.xl,
    gap: UiTheme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: UiTheme.spacing.sm,
  },
  headerTextGroup: { flex: 1, gap: UiTheme.spacing.xs },
  title: { fontSize: 24, fontWeight: '900', color: UiTheme.colors.textPrimary },
  subtitle: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: UiTheme.spacing.xs },
  metaText: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
  metaSeparator: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption },
  closeButton: { padding: UiTheme.spacing.xs },
  closeText: { color: UiTheme.colors.accent, fontWeight: '800' },
  content: { gap: UiTheme.spacing.md, paddingBottom: UiTheme.spacing.md },
  section: { gap: UiTheme.spacing.xs },
  sectionTitle: { color: UiTheme.colors.textPrimary, fontSize: UiTheme.font.subtitle, fontWeight: '800' },
  sectionText: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body },
  exerciseCard: {
    backgroundColor: UiTheme.colors.surface,
    borderColor: UiTheme.colors.border,
    borderWidth: 1,
    borderRadius: UiTheme.radius.md,
    padding: UiTheme.spacing.md,
    gap: UiTheme.spacing.xs,
  },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: UiTheme.spacing.sm },
  exerciseName: { fontWeight: '800', fontSize: 16, color: UiTheme.colors.textPrimary, flex: 1 },
  exerciseReps: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.caption, fontWeight: '700' },
  exerciseDetail: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body },
  exerciseEquipment: { color: UiTheme.colors.accent, fontSize: UiTheme.font.caption, fontWeight: '700' },
  startButton: {
    backgroundColor: UiTheme.colors.accent,
    borderRadius: UiTheme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: { color: UiTheme.colors.surface, fontSize: UiTheme.font.body, fontWeight: '800' },
});