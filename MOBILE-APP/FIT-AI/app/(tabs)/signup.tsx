import { Image } from 'expo-image';
import { Href, Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { UiTheme } from '@/constants/ui-theme';
import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';
import { getApiErrorMessage, register } from '@/services/backend';
import { useUserProfile } from '@/stores/user-profile';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { updateProfile } = useUserProfile();
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const validationRules: Record<string, ValidationRule<string>[]> = {
    username: [
      { validate: (val) => val.trim().length > 0, message: 'Username is required' },
      { validate: (val) => val.trim().length >= 3, message: 'Username must be at least 3 characters' },
      {
        validate: (val) => /^[a-zA-Z0-9_]+$/.test(val.trim()),
        message: 'Username can only contain letters, numbers, and underscores',
      },
    ],
    email: [
      { validate: (val) => val.trim().length > 0, message: 'Email is required' },
      { validate: (val) => /\S+@\S+\.\S+/.test(val.trim()), message: 'Please enter a valid email address' },
    ],
    password: [
      { validate: (val) => val.length > 0, message: 'Password is required' },
      { validate: (val) => val.length >= 8, message: 'Password must be at least 8 characters' },
      {
        validate: (val) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      },
    ],
    confirmPassword: [{ validate: (val) => val === password, message: 'Passwords do not match' }],
  };

  const { validateField, validateAll, setFieldTouched, getFieldError } = useFormValidation();

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    validateField('username', text, validationRules.username);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateField('email', text, validationRules.email);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validateField('password', text, validationRules.password);
    if (confirmPassword) {
      validateField('confirmPassword', confirmPassword, validationRules.confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    validateField('confirmPassword', text, validationRules.confirmPassword);
  };

  const hasMinPassword = password.length >= 8;
  const canSubmit =
    accepted &&
    username.trim().length >= 3 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    confirmPassword.length > 0 &&
    !getFieldError('username') &&
    !getFieldError('email') &&
    !getFieldError('password') &&
    !getFieldError('confirmPassword');

  async function handleSignup() {
    if (!validateAll({ username, email, password, confirmPassword }, validationRules)) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      updateProfile({
        name: username.trim(),
      });

      Alert.alert('Account created', `Welcome, ${username.trim()}! Let\'s set up your profile.`);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAccepted(false);
      router.push('/user' as Href);
    } catch (error) {
      Alert.alert('Signup Failed', getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen scroll={false} withBottomNavPadding={false} contentContainerStyle={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          <Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Create your account
            </ThemedText>
            <ThemedText style={styles.subtitle}>Start building workouts tailored to you.</ThemedText>
          </View>

          <View style={styles.form}>
            <TextField
              label="Username"
              value={username}
              onChangeText={handleUsernameChange}
              onBlur={() => setFieldTouched('username')}
              placeholder="Choose a username"
              autoCapitalize="none"
              autoCorrect={false}
              leftIconName="person"
              error={getFieldError('username') ?? null}
              returnKeyType="next"
            />

            <TextField
              label="Email"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={() => setFieldTouched('email')}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIconName="mail"
              error={getFieldError('email') ?? null}
              returnKeyType="next"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={() => setFieldTouched('password')}
              placeholder="Create a strong password"
              secureTextEntry
              leftIconName="lock"
              helperText={!hasMinPassword && password.length > 0 ? 'Use 8+ characters with uppercase, lowercase, and a number.' : undefined}
              error={getFieldError('password') ?? null}
              returnKeyType="next"
            />

            <TextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              onBlur={() => setFieldTouched('confirmPassword')}
              placeholder="Re-enter your password"
              secureTextEntry
              leftIconName="lock"
              error={getFieldError('confirmPassword') ?? null}
              returnKeyType="done"
            />

            <Pressable
              onPress={() => setAccepted((s) => !s)}
              accessibilityRole="checkbox"
              accessibilityLabel="Agree to Terms and Privacy"
              accessibilityState={{ checked: accepted }}
              style={styles.checkboxRow}
              hitSlop={10}
            >
              <View style={[styles.checkbox, accepted ? styles.checkboxChecked : null]} />
              <ThemedText style={styles.checkboxLabel}>
                <ThemedText type="link" onPress={() => setShowTerms(true)}>
                  I have read the terms and privacy policy
                </ThemedText>
              </ThemedText>
            </Pressable>

            <Button title="Create account" onPress={handleSignup} loading={isLoading} disabled={!canSubmit || isLoading} />

            <ThemedText style={styles.orText}>OR</ThemedText>

            <ThemedText style={styles.orText}>
              Already have an account?{' '}
              <Link href={'/login' as Href} style={styles.linkText}>
                <ThemedText type="link">Log in</ThemedText>
              </Link>
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showTerms} animationType="slide" onRequestClose={() => setShowTerms(false)}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <ThemedText type="title" style={styles.modalTitle}>
              Terms & Privacy
            </ThemedText>

            <ThemedText style={styles.modalText}>
              It’s required by law: apps are legally obligated (by laws like GDPR) to get your permission before collecting personal data (like your name, email, or location). Checking this box fulfills that requirement.
            </ThemedText>

            <ThemedText style={styles.modalText}>
              It’s a binding contract: by clicking Agree, the user enters a legally binding agreement. They cannot later claim they were unaware of the app’s rules.
            </ThemedText>

            <ThemedText style={styles.modalText}>
              The Terms of Service cover the rules: this document outlines do’s and don’ts, user conduct, and the app’s right to terminate accounts.
            </ThemedText>

            <ThemedText style={styles.modalText}>
              The Privacy Policy covers your data: this document explains what data the app collects, how it will be used, and whether it will be shared with third parties.
            </ThemedText>

            <Button title="Close" onPress={() => setShowTerms(false)} />
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { paddingTop: UiTheme.spacing.lg, paddingHorizontal: UiTheme.spacing.lg },
  container: { flexGrow: 1, justifyContent: 'center', paddingBottom: UiTheme.spacing.xl },
  header: { alignItems: 'center', gap: 6, marginBottom: UiTheme.spacing.lg },
  form: { gap: UiTheme.spacing.sm },
  title: {
    textAlign: 'center',
    color: UiTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: { color: UiTheme.colors.textSecondary, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  orText: {
    textAlign: 'center',
    color: UiTheme.colors.textSecondary,
    marginVertical: 8,
  },
  linkText: {
    textDecorationLine: 'none',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 12,
  },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: UiTheme.colors.border, backgroundColor: UiTheme.colors.surface },
  checkboxChecked: { backgroundColor: UiTheme.colors.accent, borderColor: UiTheme.colors.accent },
  checkboxLabel: { flex: 1, color: UiTheme.colors.textPrimary, fontSize: 15 },

  modalContainer: { flex: 1, padding: 20, backgroundColor: UiTheme.colors.page },
  modalTitle: { textAlign: 'center', marginBottom: 12, color: UiTheme.colors.textPrimary, fontWeight: '900', fontSize: 20 },
  modalContent: {
    backgroundColor: UiTheme.colors.surface,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    gap: 12,
    ...UiTheme.shadow.card,
  },
  modalText: { color: UiTheme.colors.textSecondary, fontSize: 15, lineHeight: 22 },
});
