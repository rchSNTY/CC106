import { Image } from 'expo-image';
import { Href, Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ErrorText } from '@/components/ErrorText';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiTheme } from '@/constants/ui-theme';
import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const validationRules: Record<string, ValidationRule<string>[]> = {
    username: [
      { validate: (val) => val.trim().length > 0, message: 'Username is required' },
      { validate: (val) => val.trim().length >= 3, message: 'Username must be at least 3 characters' },
    ],
    password: [
      { validate: (val) => val.length > 0, message: 'Password is required' },
    ],
  };

  const { validateField, validateAll, setFieldTouched, getFieldError } = useFormValidation();

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    validateField('username', text, validationRules.username);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validateField('password', text, validationRules.password);
  };

  const canSubmit = username.trim().length >= 3 && password.length > 0 && !getFieldError('username') && !getFieldError('password');

  function handleLogin() {
    if (!validateAll({ username, password }, validationRules)) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    const normalizedUsername = username.trim();
    Alert.alert('Success', `Welcome back, ${normalizedUsername}!`);
    router.push('/user' as Href);
  }

  return (
    <ThemedView style={styles.container}>
      <Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />
      <ThemedText type="title" style={styles.title}>Login Your Account</ThemedText>

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

        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={() => setFieldTouched('password')}
          placeholder="Password"
          secureTextEntry
          style={[styles.input, getFieldError('password') && styles.inputError]}
        />
        <ErrorText error={getFieldError('password')} />

        <View style={{ marginTop: 8 }}>
          
          <TouchableOpacity onPress={handleLogin} style={[styles.button, !canSubmit && styles.buttonDisabled]} activeOpacity={0.9} disabled={!canSubmit}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>Login</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.signupText}>
          Dont Have an account Yet?{' '}
          <Link href={'/signup' as Href} style={styles.linkText}>
            <ThemedText type="link">Signup Here</ThemedText>
          </Link>
        </ThemedText>
      </View>
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
  signupText: {
    textAlign: 'center',
    color: UiTheme.colors.textSecondary,
    marginTop: 8,
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
  buttonDisabled: { opacity: 0.6 },
});
