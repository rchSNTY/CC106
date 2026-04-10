import { UiTheme } from '@/constants/ui-theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import React, { JSX } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PROFILE_DATA = {
  name: 'User Name',
  gender: 'Female',
  height: '165 cm',
  weight: '60 kg',
  activityLevel: 'Moderate',
};

export default function Profile(): JSX.Element {
  const router = useRouter();

  function handleLogout() {
    router.push('/login' as Href);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={UiTheme.colors.page} />

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={UiTheme.colors.textPrimary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/user-logo.png')} style={styles.avatar} contentFit="cover" />
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>{PROFILE_DATA.name}</Text>
            <Text style={styles.headerSubtitle}>{PROFILE_DATA.gender}</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <Text style={styles.fieldValue}>{PROFILE_DATA.gender}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Height</Text>
            <Text style={styles.fieldValue}>{PROFILE_DATA.height}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Weight</Text>
            <Text style={styles.fieldValue}>{PROFILE_DATA.weight}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Activity Level</Text>
            <Text style={styles.fieldValue}>{PROFILE_DATA.activityLevel}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/user' as Href)} style={styles.editButton} activeOpacity={0.85}>
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.85}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UiTheme.colors.page },
  backButton: {
    marginTop: UiTheme.spacing.xxl,
    marginLeft: UiTheme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: { color: UiTheme.colors.textPrimary, fontSize: 16, marginLeft: 4, fontWeight: '600' },
  container: {
    flex: 1,
    padding: UiTheme.spacing.xl,
    justifyContent: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: UiTheme.spacing.xxl },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: UiTheme.colors.surfaceMuted,
    marginRight: UiTheme.spacing.xl,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
  },
  headerTextCol: { justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: UiTheme.colors.textPrimary, marginBottom: 4, letterSpacing: 1 },
  headerSubtitle: { fontSize: 18, fontWeight: '600', color: UiTheme.colors.textSecondary, letterSpacing: 1 },
  formSection: { gap: UiTheme.spacing.md },
  fieldRow: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    height: 56,
    paddingHorizontal: UiTheme.spacing.lg,
    shadowColor: UiTheme.colors.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 15,
    color: UiTheme.colors.textPrimary,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  fieldValue: {
    fontSize: 15,
    color: UiTheme.colors.textSecondary,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: UiTheme.colors.accent,
    borderRadius: UiTheme.radius.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UiTheme.spacing.xs,
  },
  editText: {
    color: UiTheme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: UiTheme.colors.danger,
    borderRadius: UiTheme.radius.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UiTheme.spacing.md,
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
