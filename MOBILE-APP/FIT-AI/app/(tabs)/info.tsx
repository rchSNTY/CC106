import { useRouter } from 'expo-router';
import React, { JSX } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { UiTheme } from '@/constants/ui-theme';

const FAQ_ITEMS = [
  {
    question: 'How are workouts recommended?',
    answer: 'FIT-AI uses your profile details, selected intensity, and workout history to suggest routines.',
  },
  {
    question: 'Can I update my profile later?',
    answer: 'Yes. Open Profile and use Edit Profile to update body metrics and preferences anytime.',
  },
  {
    question: 'Is this medical advice?',
    answer: 'No. FIT-AI provides fitness guidance only. Consult a licensed professional for medical concerns.',
  },
];

export default function InfoScreen(): JSX.Element {
  const router = useRouter();

  function handleContactSupport() {
    Alert.alert('Support', 'Email support@fitai.app for help with your account or workout plans.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={UiTheme.colors.page} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Help & Info</Text>
        <Text style={styles.subtitle}>Everything you need to use FIT-AI safely and effectively.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About FIT-AI</Text>
          <Text style={styles.cardText}>
            FIT-AI is a guided fitness companion that helps you pick routines based on your goals, intensity, and progress.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Safety Reminder</Text>
          <Text style={styles.cardText}>
            Warm up first, hydrate regularly, and stop immediately if you feel sharp pain, dizziness, or discomfort.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item) => (
              <View key={item.question} style={styles.faqCard}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>
          <Text style={styles.cardText}>Need help with account setup, profile, or workout recommendations?</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleContactSupport}>
            <Text style={styles.primaryButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>App Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UiTheme.colors.page,
  },
  container: {
    padding: UiTheme.spacing.lg,
    gap: UiTheme.spacing.md,
  },
  backButton: {
    marginTop: UiTheme.spacing.lg,
    alignSelf: 'flex-start',
    paddingVertical: UiTheme.spacing.xs,
    paddingHorizontal: UiTheme.spacing.sm,
    borderRadius: UiTheme.radius.sm,
    backgroundColor: UiTheme.colors.surface,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
  },
  backText: {
    color: UiTheme.colors.textPrimary,
    fontWeight: '700',
  },
  title: {
    color: UiTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.body,
  },
  section: {
    gap: UiTheme.spacing.sm,
  },
  sectionTitle: {
    color: UiTheme.colors.textPrimary,
    fontSize: UiTheme.font.subtitle,
    fontWeight: '800',
  },
  card: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    padding: UiTheme.spacing.md,
    gap: UiTheme.spacing.xs,
  },
  cardTitle: {
    color: UiTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  cardText: {
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.body,
    lineHeight: 20,
  },
  faqList: {
    gap: UiTheme.spacing.sm,
  },
  faqCard: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.md,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    padding: UiTheme.spacing.md,
    gap: UiTheme.spacing.xs,
  },
  faqQuestion: {
    color: UiTheme.colors.textPrimary,
    fontWeight: '800',
    fontSize: UiTheme.font.body,
  },
  faqAnswer: {
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.body,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: UiTheme.spacing.xs,
    backgroundColor: UiTheme.colors.accent,
    borderRadius: UiTheme.radius.sm,
    alignItems: 'center',
    paddingVertical: UiTheme.spacing.sm,
  },
  primaryButtonText: {
    color: UiTheme.colors.surface,
    fontWeight: '800',
  },
  version: {
    textAlign: 'center',
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.caption,
    marginTop: UiTheme.spacing.sm,
    marginBottom: UiTheme.spacing.xl,
  },
});
