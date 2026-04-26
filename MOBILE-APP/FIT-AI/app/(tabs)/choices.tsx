import { Href, useRouter } from 'expo-router'
import React, { JSX, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ConfirmationModal } from '@/components/confirmation-modal'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { UiTheme } from '@/constants/ui-theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import { getApiErrorMessage, upsertProfile } from '@/services/backend'
import { useUserProfile } from '@/stores/user-profile'

type Step = 1 | 2

type OptionButtonProps = {
  label: string
  description: string
  selected: boolean
  tint: string
  onPress: () => void
}

function OptionButton({ label, description, selected, tint, onPress }: OptionButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.option,
        selected ? { backgroundColor: tint, borderColor: tint } : {},
      ]}
    >
      <ThemedText style={[styles.optionText, selected ? styles.optionTextSelected : {}]}>{label.toUpperCase()}</ThemedText>
      <ThemedText style={[styles.optionDesc, selected ? styles.optionDescSelected : {}]}>{description}</ThemedText>
    </TouchableOpacity>
  )
}

export default function ChoicesScreen(): JSX.Element {
  const tint = useThemeColor({}, 'tint')
  const router = useRouter()
  const { profile, updateProfile } = useUserProfile()

  const [step, setStep] = useState<Step>(1)
  const [activity, setActivity] = useState<string | null>(null)
  const [workout, setWorkout] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const activityOptions = [
    { label: 'Light', desc: 'Gentle workouts, perfect for beginners or recovery days.' },
    { label: 'Moderate', desc: 'Balanced intensity for regular fitness enthusiasts.' },
    { label: 'Intense', desc: 'High-energy sessions for advanced users seeking maximum results.' },
  ]
  const workoutOptions = [
    { label: 'Cardio', desc: 'Focus on heart health and endurance with running or cycling.' },
    { label: 'Bodyweight', desc: 'Strength training using your own body weight, no equipment needed.' },
    { label: 'Weight', desc: 'Build muscle with resistance training and weights.' },
  ]

  function goToStepTwo() {
    if (!activity) {
      Alert.alert('Selection Required', 'Please select an activity level to continue.');
      return;
    }
    setStep(2);
  }

  function finishChoices() {
    if (!activity || !workout) {
      Alert.alert('Selection Required', 'Please complete both steps to begin your fitness journey.');
      return;
    }
    setShowConfirmation(true);
  }

  async function handleConfirmFinish() {
    setShowConfirmation(false);
    const mergedProfile = { ...profile, activityLevel: activity!, workout: workout! };
    updateProfile(mergedProfile);

    try {
      await upsertProfile(mergedProfile);
      router.push('/Homepage' as Href);
    } catch (error) {
      Alert.alert('Save Failed', getApiErrorMessage(error));
    }
  }

  return (
    <>
      <ThemedView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.progressWrap}>
          <View style={[styles.progressDot, step >= 1 ? { backgroundColor: tint, borderColor: tint } : {}]}>
            <ThemedText style={[styles.progressLabel, step >= 1 ? styles.progressLabelActive : {}]}>1</ThemedText>
          </View>
          <View style={[styles.progressLine, step === 2 ? { backgroundColor: tint } : {}]} />
          <View style={[styles.progressDot, step >= 2 ? { backgroundColor: tint, borderColor: tint } : {}]}>
            <ThemedText style={[styles.progressLabel, step >= 2 ? styles.progressLabelActive : {}]}>2</ThemedText>
          </View>
        </View>

        {step === 1 ? (
          <>
            <ThemedText style={styles.header}>SELECT YOUR ACTIVITY LEVEL</ThemedText>
            <ThemedText style={styles.subheader}>This helps tailor the intensity of your plan.</ThemedText>

            <View style={styles.optionsWrap}>
              {activityOptions.map((opt) => (
                <OptionButton
                  key={opt.label}
                  label={opt.label}
                  description={opt.desc}
                  selected={activity === opt.label}
                  tint={tint}
                  onPress={() => setActivity(opt.label)}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={goToStepTwo}
              disabled={!activity}
              activeOpacity={0.9}
              style={[styles.primaryButton, !activity ? styles.primaryButtonDisabled : { backgroundColor: tint }]}
            >
              <ThemedText style={styles.primaryButtonText}>CONTINUE</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ThemedText style={styles.header}>CHOOSE WORKOUT SELECTION</ThemedText>
            <ThemedText style={styles.subheader}>Pick your preferred training style to begin.</ThemedText>

            <View style={styles.optionsWrap}>
              {workoutOptions.map((opt) => (
                <OptionButton
                  key={opt.label}
                  label={opt.label}
                  description={opt.desc}
                  selected={workout === opt.label}
                  tint={tint}
                  onPress={() => setWorkout(opt.label)}
                />
              ))}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => setStep(1)} activeOpacity={0.9} style={styles.backButton}>
                <ThemedText style={styles.backText}>BACK</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={finishChoices}
                disabled={!workout}
                activeOpacity={0.9}
                style={[styles.primaryButton, styles.finishButton, !workout ? styles.primaryButtonDisabled : { backgroundColor: tint }]}
              >
                <ThemedText style={styles.primaryButtonText}>FINISH</ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}
        </View>
      </ThemedView>

      <ConfirmationModal
        visible={showConfirmation}
        title="Complete Setup"
        message={`Activity Level: ${activity}\nWorkout Type: ${workout}\n\nReady to start your fitness journey?`}
        confirmText="Start"
        cancelText="Review"
        onConfirm={handleConfirmFinish}
        onCancel={() => setShowConfirmation(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: UiTheme.spacing.lg,
    backgroundColor: UiTheme.colors.page,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.xl,
    paddingVertical: UiTheme.spacing.xl,
    paddingHorizontal: UiTheme.spacing.lg,
    marginHorizontal: UiTheme.spacing.xs,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    shadowColor: UiTheme.colors.textPrimary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: UiTheme.spacing.lg,
    width: 130,
  },
  progressDot: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UiTheme.colors.surfaceMuted,
  },
  progressLabel: {
    fontSize: UiTheme.font.caption,
    fontWeight: '800',
    color: UiTheme.colors.textSecondary,
  },
  progressLabelActive: {
    color: UiTheme.colors.surface,
  },
  progressLine: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: UiTheme.colors.border,
    marginHorizontal: UiTheme.spacing.sm,
  },
  header: {
    fontWeight: '900',
    marginBottom: UiTheme.spacing.xs,
    letterSpacing: 0.6,
    fontSize: UiTheme.font.body,
    color: UiTheme.colors.textPrimary,
    textAlign: 'center',
  },
  subheader: {
    color: UiTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: UiTheme.spacing.md,
    fontSize: UiTheme.font.body,
  },
  optionsWrap: {
    width: '100%',
    marginBottom: UiTheme.spacing.md,
  },
  option: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: UiTheme.radius.md,
    backgroundColor: UiTheme.colors.surfaceMuted,
    marginVertical: UiTheme.spacing.xs,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: UiTheme.colors.border,
  },
  optionText: {
    color: UiTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  optionTextSelected: {
    color: UiTheme.colors.surface,
  },
  optionDesc: {
    fontSize: UiTheme.font.caption,
    color: UiTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: UiTheme.spacing.xs,
  },
  optionDescSelected: {
    color: UiTheme.colors.surface,
  },
  primaryButton: {
    marginTop: UiTheme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: UiTheme.spacing.sm,
    borderRadius: UiTheme.radius.md,
    minWidth: 120,
  },
  primaryButtonDisabled: {
    backgroundColor: UiTheme.colors.border,
  },
  primaryButtonText: {
    color: UiTheme.colors.surface,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: UiTheme.spacing.xs,
  },
  backButton: {
    paddingVertical: UiTheme.spacing.sm,
    paddingHorizontal: UiTheme.spacing.md,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    borderRadius: UiTheme.radius.sm,
    backgroundColor: UiTheme.colors.surface,
  },
  backText: {
    color: UiTheme.colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  finishButton: {
    marginTop: 0,
    flexGrow: 1,
    marginLeft: UiTheme.spacing.sm,
  },
})
