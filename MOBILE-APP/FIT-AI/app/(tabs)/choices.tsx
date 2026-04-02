import React, { JSX, useState } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { useRouter, Href } from 'expo-router'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
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
    // navigate to Homepage after selecting a workout
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
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginHorizontal: 12 },
  cardStep1: { backgroundColor: '#f3f8ff' },
  cardStep2: { backgroundColor: '#fff7f3' },
  header: { fontWeight: '900', marginBottom: 14, letterSpacing: 0.6, fontSize: 14 },
  option: {
    width: '90%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ececec',
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cfcfcf',
  },
  optionText: { color: '#111', fontSize: 13, fontWeight: '800' },
  backButton: { marginTop: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 16, borderRadius: 8 },
  backText: { color: '#444', fontWeight: '800' },
})
