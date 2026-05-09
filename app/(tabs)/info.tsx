import { UiTheme } from '@/constants/ui-theme';
import { useRouter } from 'expo-router';
import React, { JSX, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SupportContactModal from '../../components/SupportContactModal';

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
  const [showSupportModal, setShowSupportModal] = useState(false);

  const supportContact = {
    name: 'James Encagueszer Racho Jr',
    email: 'rachojr.jamesencagueszer.palec@gmail.com',
    phone: '+639197639326',
    github: 'https://github.com/rchSNTY',
    linkedin: 'linkedin.com/in/james-encagueszer-racho-85613b328',
  };

  function handleContactSupport() {
    setShowSupportModal(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={UiTheme.colors.page} />

      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Help & Info</Text>
          <Text style={styles.subtitle}>Everything you need to use FIT-AI safely and effectively.</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

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

      <SupportContactModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        name={supportContact.name}
        email={supportContact.email}
        phone={supportContact.phone}
        github={supportContact.github}
        linkedin={supportContact.linkedin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UiTheme.colors.page,
    paddingTop: UiTheme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: UiTheme.spacing.lg,
    paddingTop: UiTheme.spacing.lg,
    paddingBottom: UiTheme.spacing.sm,
    gap: UiTheme.spacing.md,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: UiTheme.spacing.sm,
  },
  container: {
    flexGrow: 1,
    padding: UiTheme.spacing.lg,
    paddingTop: UiTheme.spacing.xs,
    paddingBottom: UiTheme.spacing.xl,
    gap: UiTheme.spacing.md,
  },
  backButton: {
    paddingVertical: UiTheme.spacing.sm,
    paddingHorizontal: UiTheme.spacing.md,
    borderRadius: UiTheme.radius.sm,
    backgroundColor: UiTheme.colors.surface,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
  },
  backText: {
    color: UiTheme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  title: {
    color: UiTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    flexShrink: 1,
  },
  subtitle: {
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.body,
    marginTop: 4,
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
