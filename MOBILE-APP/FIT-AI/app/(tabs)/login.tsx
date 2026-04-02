import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View,} from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter, Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
 
  


  function handleLogin() {
    if (!username.trim() || !password) {
      Alert.alert('Missing fields', 'Please provide both username and password.');
      return;
    }

    // Mock Login
    Alert.alert('Success', `Welcome back, ${username}!`);
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
          onChangeText={setUsername}
          placeholder="Enter username"
          style={styles.input}
          autoCapitalize="none"
        />

        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        <View style={{ marginTop: 8 }}>
          
          <TouchableOpacity onPress={handleLogin} style={styles.button} activeOpacity={0.9}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>Login</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.signupText}>
          Dont Have an account Yet?{' '}
          <Link href={"/" as Href} style={styles.linkText}>
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
    padding: 20,
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  signupText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 8,
  },
  linkText: {
    textDecorationLine: 'none',
  },
  title: {
    textAlign: 'center',
    fontWeight: '800',
    color: '#222',
    fontSize: 28,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 12,
  },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#ccc' },
  checkboxChecked: { backgroundColor: '#28a745', borderColor: '#28a745' },
  checkboxLabel: { flex: 1, color: '#222' },

  modalContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  modalTitle: { textAlign: 'center', marginBottom: 12 },
  doneButton: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#28a745' },
  buttonDisabled: { opacity: 0.6 },
});
