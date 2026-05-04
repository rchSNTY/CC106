import { UiTheme } from '@/constants/ui-theme';
import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import React, { JSX, useMemo, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import { ConfirmationModal } from '@/components/confirmation-modal';
import BottomTabNav from '@/components/ui/bottom-tab-nav';
import { logout } from '@/services/backend';
import { useUserProfile } from '@/stores/user-profile';

type PendingAction = 'edit' | 'logout' | null;

export default function Profile(): JSX.Element {
  const router = useRouter();
  const { profile, resetProfile } = useUserProfile();
  const { width, height } = useWindowDimensions();
  const isCompact = width < 390 || height < 700;
  const headerGap = Math.max(12, Math.min(24, Math.round(width * 0.06)));
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const heightValue = profile.height ? `${profile.height} ${profile.heightUnit}` : 'Not set';
  const fieldValue = (value: string) => (value ? value : 'Not set');
  const weeklyGoalValue = profile.weeklyGoal > 0 ? `${profile.weeklyGoal} / week` : 'Not set';

  const fields = [
    { label: 'Birthday', value: fieldValue(profile.birthday) },
    { label: 'Age', value: profile.age ? profile.age : '00' },
    { label: 'Gender', value: fieldValue(profile.gender) },
    { label: 'Weekly Goal', value: weeklyGoalValue },
    { label: 'Height', value: heightValue },
    { label: 'Weight', value: fieldValue(profile.weight) },
    { label: 'Activity Level', value: fieldValue(profile.activityLevel) },
    { label: 'Workout Type', value: fieldValue(profile.workout) },
  ];

  const confirmationConfig = useMemo(() => {
    if (pendingAction === 'edit') {
      return {
        title: 'Edit profile?',
        message: 'This will take you to the profile editing screen.',
        confirmText: 'Continue',
        isDangerous: false,
        onConfirm: () => router.push('/user' as Href),
      };
    }

    if (pendingAction === 'logout') {
      return {
        title: 'Sign out?',
        message: 'You will be taken back to the login screen.',
        confirmText: 'Sign out',
        isDangerous: true,
        onConfirm: async () => {
          await logout();
          resetProfile();
          router.replace('/login' as Href);
        },
      };
    }

    return null;
  }, [pendingAction, router]);

  function handleLogout() {
    setPendingAction('logout');
  }

  function handleEditProfile() {
    setPendingAction('edit');
  }

  function closeConfirmation() {
    setPendingAction(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={UiTheme.colors.page} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, isCompact && styles.containerCompact]}
      >
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.header}>
          <Image
            source={profile.avatarUrl ? { uri: profile.avatarUrl } : require('@/assets/images/user-logo.png')}
            style={[styles.avatar, isCompact && styles.avatarCompact, { marginRight: headerGap }]}
            contentFit="cover"
          />
          <View style={styles.headerTextCol}>
            <Text style={[styles.headerTitle, isCompact && styles.headerTitleCompact]}>{fieldValue(profile.name)}</Text>
            <Text style={[styles.headerSubtitle, isCompact && styles.headerSubtitleCompact]}>{fieldValue(profile.gender)}</Text>
            <View style={styles.headerMetaRow}>
              <Text style={styles.headerMetaText}>{profile.age ? `${profile.age} yrs` : 'Age not set'}</Text>
              <Text style={styles.headerMetaText}>{profile.birthday || 'Birthday not set'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.fieldGrid}>
            {fields.map((item) => (
              <View key={item.label} style={[styles.fieldCard, isCompact && styles.fieldCardCompact]}>
                <Text style={styles.fieldLabel}>{item.label}</Text>
                <Text style={styles.fieldValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleEditProfile} style={[styles.actionButton, styles.editButton]} activeOpacity={0.85}>
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={[styles.actionButton, styles.logoutButton]} activeOpacity={0.85}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {confirmationConfig ? (
        <ConfirmationModal
          visible
          title={confirmationConfig.title}
          message={confirmationConfig.message}
          confirmText={confirmationConfig.confirmText}
          cancelText="Cancel"
          isDangerous={confirmationConfig.isDangerous}
          onCancel={closeConfirmation}
          onConfirm={async () => {
            closeConfirmation();
            await confirmationConfig.onConfirm();
          }}
        />
      ) : null}

      <BottomTabNav activeTab="Profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UiTheme.colors.page },
  container: {
    flexGrow: 1,
    paddingHorizontal: UiTheme.spacing.xl,
    paddingBottom: UiTheme.nav.height + UiTheme.spacing.xl,
  },
  containerCompact: {
    paddingHorizontal: UiTheme.spacing.lg,
    paddingBottom: UiTheme.nav.height + UiTheme.spacing.lg,
  },
  pageTitle: {
    marginTop: UiTheme.spacing.lg,
    color: UiTheme.colors.textPrimary,
    fontSize: UiTheme.font.title,
    fontWeight: '800',
    paddingBottom: UiTheme.spacing.xs,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: UiTheme.spacing.xl },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: UiTheme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
  },
  avatarCompact: { width: 84, height: 84, borderRadius: 42, marginBottom: UiTheme.spacing.md },
  headerTextCol: { flex: 1, justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: UiTheme.colors.textPrimary, marginBottom: 4, letterSpacing: 1 },
  headerTitleCompact: { fontSize: 22 },
  headerSubtitle: { fontSize: 18, fontWeight: '600', color: UiTheme.colors.textSecondary, letterSpacing: 1 },
  headerSubtitleCompact: { fontSize: 16 },
  headerMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: UiTheme.spacing.sm, marginTop: 6 },
  headerMetaText: { fontSize: 14, fontWeight: '600', color: UiTheme.colors.textSecondary },
  formSection: { gap: UiTheme.spacing.md },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: UiTheme.spacing.sm,
  },
  fieldCard: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    minHeight: 50,
    paddingHorizontal: UiTheme.spacing.lg,
    paddingVertical: UiTheme.spacing.sm,
    shadowColor: UiTheme.colors.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    justifyContent: 'center',
    width: '48.5%',
  },
  fieldCardCompact: {
    width: '48%',
  },
  fieldLabel: {
    fontSize: 13,
    color: UiTheme.colors.textPrimary,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: UiTheme.colors.textSecondary,
    fontWeight: '700',
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: UiTheme.spacing.sm,
    marginTop: UiTheme.spacing.xs,
  },
  actionButton: {
    flex: 1,
    borderRadius: UiTheme.radius.md,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: UiTheme.spacing.sm,
  },
  editButton: {
    backgroundColor: UiTheme.colors.accent,
  },
  editText: {
    color: UiTheme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: UiTheme.colors.danger,
    shadowColor: UiTheme.colors.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logoutText: {
    color: UiTheme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
