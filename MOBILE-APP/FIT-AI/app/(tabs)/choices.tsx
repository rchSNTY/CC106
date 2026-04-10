import { Href, useRouter } from 'expo-router'
import React, { JSX, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { UiTheme } from '@/constants/ui-theme'
import { useThemeColor } from '@/hooks/use-theme-color'

export default function ChoicesScreen(): JSX.Element {
  const tint = useThemeColor({}, 'tint')
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [activity, setActivity] = useState<string | null>(null)
  const [workout, setWorkout] = useState<string | null>(null)

  const activityOptions = ['Light', 'Moderate', 'Intense']
  const workoutOptions = ['Cardio', 'Bodyweight', 'Weight']

  function selectActivity(a: string) {
    setActivity(a)
    setStep(2)
  }

  function selectWorkout(w: string) {
    setWorkout(w)
    router.push('/Homepage' as Href)
  }

  return (
    <ThemedView style={styles.container}>
      {step === 1 ? (
        <View style={[styles.card, styles.cardStep1]}>
          <ThemedText style={[styles.header, { color: '#111' }]}>SELECT YOUR ACTIVITY LEVEL</ThemedText>
          {activityOptions.map((opt) => {
            const selected = activity === opt
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => selectActivity(opt)}
                activeOpacity={0.9}
                style={[
                  styles.option,
                  selected ? { backgroundColor: tint, borderColor: tint } : {},
                ]}
              >
                <ThemedText style={[styles.optionText, selected ? { color: '#fff' } : {}]}>{opt.toUpperCase()}</ThemedText>
              </TouchableOpacity>
            )
          })}
        </View>
      ) : (
        <View style={[styles.card, styles.cardStep2]}>
          <ThemedText style={[styles.header, { color: '#111' }]}>CHOOSE WORKOUT SELECTION</ThemedText>
          {workoutOptions.map((opt) => {
            const selected = workout === opt
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => selectWorkout(opt)}
                activeOpacity={0.9}
                style={[
                  styles.option,
                  selected ? { backgroundColor: tint, borderColor: tint } : {},
                ]}
              >
                <ThemedText style={[styles.optionText, selected ? { color: '#fff' } : {}]}>{opt.toUpperCase()}</ThemedText>
              </TouchableOpacity>
            )
          })}

          <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
            <ThemedText style={styles.backText}>BACK</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: UiTheme.spacing.lg, backgroundColor: UiTheme.colors.page, justifyContent: 'center' },
  card: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    padding: UiTheme.spacing.lg,
    alignItems: 'center',
    marginHorizontal: UiTheme.spacing.sm,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
  },
  cardStep1: { backgroundColor: '#EFF7FF' },
  cardStep2: { backgroundColor: '#FFF7F1' },
  header: { fontWeight: '900', marginBottom: 14, letterSpacing: 0.6, fontSize: 14 },
  option: {
    width: '90%',
    paddingVertical: 12,
    borderRadius: UiTheme.radius.md,
    backgroundColor: UiTheme.colors.surfaceMuted,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: UiTheme.colors.border,
  },
  optionText: { color: UiTheme.colors.textPrimary, fontSize: 13, fontWeight: '800' },
  backButton: {
    marginTop: UiTheme.spacing.md,
    paddingVertical: UiTheme.spacing.sm,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    paddingHorizontal: UiTheme.spacing.md,
    borderRadius: UiTheme.radius.sm,
  },
  backText: { color: UiTheme.colors.textSecondary, fontWeight: '800' },
})
