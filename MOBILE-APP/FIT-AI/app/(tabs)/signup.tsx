import { Image } from 'expo-image';
import { Href, Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ErrorText } from '@/components/ErrorText';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiTheme } from '@/constants/ui-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const validationRules: Record<string, ValidationRule<string>[]> = {
    username: [
      { validate: (val) => val.trim().length > 0, message: 'Username is required' },
      { validate: (val) => val.trim().length >= 3, message: 'Username must be at least 3 characters' },
      { validate: (val) => /^[a-zA-Z0-9_]+$/.test(val.trim()), message: 'Username can only contain letters, numbers, and underscores' },
    ],
    email: [
      { validate: (val) => val.trim().length > 0, message: 'Email is required' },
      { validate: (val) => /\S+@\S+\.\S+/.test(val.trim()), message: 'Please enter a valid email address' },
    ],
    password: [
      { validate: (val) => val.length > 0, message: 'Password is required' },
      { validate: (val) => val.length >= 8, message: 'Password must be at least 8 characters' },
      { validate: (val) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val), message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
    ],
    confirmPassword: [
      { validate: (val) => val === password, message: 'Passwords do not match' },
    ],
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

    setIsLoading(true);
    // Simulate async operation
    setTimeout(() => {
      Alert.alert('Account created', `Welcome, ${username}! Please log in.`);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAccepted(false);
      router.push('/login' as Href);
      setIsLoading(false);
    }, 2000);
  }

  return (
    <ThemedView style={styles.container}>
      <Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />
      <ThemedText type="title" style={styles.title}>Create an Account</ThemedText>

      <View style={styles.form}>
        <ThemedText style={styles.label}>Username</ThemedText>
        <TextInput
          value={username}
          onChangeText={handleUsernameChange}
          onBlur={() => setFieldTouched('username')}
          placeholder="Enter username"
          style={[styles.input, getFieldError('username') && styles.inputError]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ErrorText error={getFieldError('username')} />

        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          value={email}
          onChangeText={handleEmailChange}
          onBlur={() => setFieldTouched('email')}
          placeholder="juandelacruz@gmail.com"
          keyboardType="email-address"
          style={[styles.input, getFieldError('email') && styles.inputError]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ErrorText error={getFieldError('email')} />

        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={() => setFieldTouched('password')}
          placeholder="Password"
          secureTextEntry
          style={[styles.input, getFieldError('password') && styles.inputError]}
        />
        {!hasMinPassword && password.length > 0 ? (
          <ThemedText style={styles.inlineHint}>Use at least 8 characters with uppercase, lowercase, and number.</ThemedText>
        ) : null}
        <ErrorText error={getFieldError('password')} />

        <ThemedText style={styles.label}>Confirm Password</ThemedText>
        <TextInput
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          onBlur={() => setFieldTouched('confirmPassword')}
          placeholder="Confirm Password"
          secureTextEntry
          style={[styles.input, getFieldError('confirmPassword') && styles.inputError]}
        />
        <ErrorText error={getFieldError('confirmPassword')} />

        <View style={{ marginTop: 8 }}>
          <Pressable onPress={() => setAccepted((s) => !s)} style={styles.checkboxRow}>
            <View style={[styles.checkbox, accepted ? styles.checkboxChecked : {}]} />
            <ThemedText style={[styles.checkboxLabel, { color: textColor, fontSize: 15 }]}> 
              <ThemedText type="link" onPress={() => setShowTerms(true)}> I have read the terms and privacy policy</ThemedText>
            </ThemedText>
          </Pressable>

          <TouchableOpacity onPress={handleSignup} style={[styles.button, !canSubmit && styles.buttonDisabled]} activeOpacity={0.9} disabled={!canSubmit || isLoading}>
            {isLoading ? (
              <ActivityIndicator color={UiTheme.colors.surface} />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>Signup</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.orText}>OR</ThemedText>

        <ThemedText style={styles.orText}>
          Have an Account?{' '}
          <Link href={'/login' as Href} style={styles.linkText}>
            <ThemedText type="link">Login here</ThemedText>
          </Link>
        </ThemedText>
      </View>
      <Modal visible={showTerms} animationType="slide" onRequestClose={() => setShowTerms(false)}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <ThemedText type="title" style={styles.modalTitle}>Terms & Privacy</ThemedText>

            <ThemedText style={[styles.modalText, { marginBottom: 12 }]}>It’s Required by Law: Apps are legally obligated (by laws like GDPR) to get your permission before collecting personal data (like your name, email, or location). Checking this box fulfills that requirement.</ThemedText>

            <ThemedText style={[styles.modalText, { marginBottom: 12 }]}>It’s a Binding Contract: By clicking Agree, the user enters a legally binding agreement. They cannot later claim they were unaware of the apps rules.</ThemedText>

            <ThemedText style={[styles.modalText, { marginBottom: 12 }]}>The Terms of Service (ToS) covers the Rules: This document outlines the dos and donts of the app, rules for user conduct, payment terms, and the apps right to terminate accounts.</ThemedText>

            <ThemedText style={styles.modalText}>The Privacy Policy covers your Data: This document explains exactly what data the app collects, how it will be used (e.g., for improvements or advertising), and if it will be shared with third parties.</ThemedText>

            <TouchableOpacity onPress={() => setShowTerms(false)} style={styles.doneButton}>
              <ThemedText type="defaultSemiBold" style={styles.doneButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: UiTheme.spacing.lg,
    justifyContent: 'center',
    gap: UiTheme.spacing.md,
    backgroundColor: UiTheme.colors.page,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    padding: 12,
    borderRadius: UiTheme.radius.sm,
    backgroundColor: UiTheme.colors.surface,
    fontSize: 16,
  },
  inputError: {
    borderColor: UiTheme.colors.danger,
  },
  inlineHint: {
    marginTop: -6,
    color: UiTheme.colors.textSecondary,
    fontSize: UiTheme.font.caption,
  },
  button: {
    marginTop: 8,
    backgroundColor: UiTheme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: UiTheme.radius.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: UiTheme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  orText: {
    textAlign: 'center',
    color: UiTheme.colors.textSecondary,
    marginVertical: 8,
  },
  linkText: {
    textDecorationLine: 'none',
  },
  title: {
    textAlign: 'center',
    fontWeight: '800',
    color: UiTheme.colors.textPrimary,
    fontSize: 28,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: UiTheme.colors.textPrimary,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 12,
  },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: UiTheme.colors.border },
  checkboxChecked: { backgroundColor: UiTheme.colors.accent, borderColor: UiTheme.colors.accent },
  checkboxLabel: { flex: 1, color: UiTheme.colors.textPrimary },

  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { textAlign: 'center', marginBottom: 12, color: UiTheme.colors.textPrimary, fontWeight: '700', fontSize: 18 },
  modalContent: {
    backgroundColor: UiTheme.colors.surface,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: UiTheme.colors.textPrimary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modalText: { color: UiTheme.colors.textSecondary, fontSize: 15, lineHeight: 22 },
  doneButtonText: { color: UiTheme.colors.surface, fontSize: 16, fontWeight: '700' },
  doneButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: UiTheme.radius.sm,
    alignItems: 'center',
    backgroundColor: UiTheme.colors.accent,
  },
  buttonDisabled: { opacity: 0.6 },
});
