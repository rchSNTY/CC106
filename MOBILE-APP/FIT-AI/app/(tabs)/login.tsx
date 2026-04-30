import { Image } from 'expo-image';
import { Href, Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { UiTheme } from '@/constants/ui-theme';
import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';
import { getApiErrorMessage, getProfile, login } from '@/services/backend';
import { useUserProfile } from '@/stores/user-profile';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setProfile } = useUserProfile();

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

  const canSubmit = username.trim().length >= 3 && password.length > 0 && !getFieldError('username') && !getFieldError('password') && !isLoading;

  async function handleLogin() {
    if (!validateAll({ username, password }, validationRules)) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ username: username.trim(), password });
      const profile = await getProfile();
      if (profile) {
        setProfile(profile);
      }

      router.push('/Homepage' as Href);
    } catch (error) {
      Alert.alert('Login Failed', getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen scroll={false} withBottomNavPadding={false} contentContainerStyle={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <Image source={require('@/assets/images/Logo.png')} style={styles.logo} contentFit="contain" />
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Welcome back</ThemedText>
            <ThemedText style={styles.subtitle}>Log in to pick up where you left off.</ThemedText>
          </View>

          <View style={styles.form}>
            <TextField
              label="Username"
              value={username}
              onChangeText={handleUsernameChange}
              onBlur={() => setFieldTouched('username')}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              importantForAutofill="no"
              leftIconName="person"
              error={getFieldError('username') ?? null}
              returnKeyType="next"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={() => setFieldTouched('password')}
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="off"
              importantForAutofill="no"
              leftIconName="lock"
              error={getFieldError('password') ?? null}
              returnKeyType="done"
            />

            <Button title="Log in" onPress={handleLogin} loading={isLoading} disabled={!canSubmit} />

            <ThemedText style={styles.signupText}>
              Don’t have an account?{' '}
              <Link href={'/signup' as Href} style={styles.linkText}>
                <ThemedText type="link">Sign up</ThemedText>
              </Link>
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { paddingTop: UiTheme.spacing.lg, paddingHorizontal: UiTheme.spacing.lg },
  container: { flexGrow: 1, justifyContent: 'center', paddingBottom: UiTheme.spacing.xl },
  header: { alignItems: 'center', gap: 6, marginBottom: UiTheme.spacing.lg },
  form: { gap: UiTheme.spacing.sm },
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
    color: UiTheme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: { color: UiTheme.colors.textSecondary, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 12,
  },
});
