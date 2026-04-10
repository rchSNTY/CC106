import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiTheme } from '@/constants/ui-theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function UserProfile() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weight, setWeight] = useState('');

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
    }
  }

  function handleDone() {
    const ageValue = Number(age);
    const heightValue = Number(height);
    const weightValue = Number(weight);

    if (!name.trim() || !gender.trim() || !birthday.trim()) {
      Alert.alert('Missing fields', 'Please provide your name, birthday, and gender.');
      return;
    }
    if (!Number.isFinite(ageValue) || ageValue <= 0) {
      Alert.alert('Invalid age', 'Please provide a valid age.');
      return;
    }
    if (!Number.isFinite(heightValue) || heightValue <= 0) {
      Alert.alert('Invalid height', 'Please provide a valid height value.');
      return;
    }
    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      Alert.alert('Invalid weight', 'Please provide a valid weight value.');
      return;
    }

    router.push('/choices' as Href);
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={pickImage} style={[styles.avatarWrap, !avatarUrl && { borderColor: tint, borderWidth: 1 }]}>
          <Image
            source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/user-logo.png')}
            style={styles.avatar}
            contentFit={avatarUrl ? 'cover' : 'contain'}
            transition={500}
          />
        </Pressable>

        <TouchableOpacity onPress={pickImage} style={[styles.photoButton, styles.photoButtonColored]}>
          <ThemedText style={{ color: '#fff' }}>{avatarUrl ? 'Change photo' : 'Add photo'}</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <ThemedText style={styles.label}>Name</ThemedText>
        <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} />

        <ThemedText style={styles.label}>Age</ThemedText>
        <TextInput value={age} onChangeText={setAge} placeholder="e.g. 29" keyboardType="numeric" style={styles.input} />

        <ThemedText style={styles.label}>Birthday</ThemedText>
        <TextInput value={birthday} onChangeText={setBirthday} placeholder="MM-DD-YYYY" style={styles.input} />

        <ThemedText style={styles.label}>Gender</ThemedText>
        <TextInput value={gender} onChangeText={setGender} placeholder="Male / Female / Other" style={styles.input} />

        <ThemedText style={styles.label}>Height (In cm)</ThemedText>
        <View style={styles.rowSmall}>
          <TextInput
            value={height}
            onChangeText={setHeight}
            placeholder={`Number (${heightUnit})`}
            keyboardType="decimal-pad"
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={() => setHeightUnit((v) => (v === 'cm' ? 'ft' : 'cm'))}
            style={[styles.unitButton, { borderColor: tint }]}
          >
            <ThemedText style={{ color: tint }}>{heightUnit}</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.label}>Weight (kg)</ThemedText>
        <TextInput value={weight} onChangeText={setWeight} placeholder="e.g. 70" keyboardType="decimal-pad" style={styles.input} />

        <TouchableOpacity onPress={handleDone} style={[styles.doneButton, styles.doneButtonColored]} activeOpacity={0.9}>
          <ThemedText type="defaultSemiBold" style={styles.doneText}>Done</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: UiTheme.spacing.lg, backgroundColor: UiTheme.colors.page },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UiTheme.spacing.xl,
    paddingTop: UiTheme.spacing.sm,
  },
  avatarWrap: {
    marginBottom: UiTheme.spacing.md,
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UiTheme.colors.surfaceMuted,
  },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  photoButton: {
    paddingVertical: UiTheme.spacing.xs,
    paddingHorizontal: UiTheme.spacing.md,
    borderRadius: UiTheme.radius.xl,
    borderWidth: 1,
    elevation: 2,
  },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: UiTheme.colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    padding: 12,
    borderRadius: UiTheme.radius.sm,
    backgroundColor: UiTheme.colors.surface,
    fontSize: 16,
  },
  rowSmall: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: UiTheme.radius.sm,
    borderWidth: 1,
    marginLeft: UiTheme.spacing.xs,
  },
  doneButton: {
    marginTop: UiTheme.spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: UiTheme.radius.sm,
    alignItems: 'center',
  },
  doneText: { color: UiTheme.colors.surface, fontSize: 16 },

  photoButtonColored: { backgroundColor: UiTheme.colors.accent, borderColor: UiTheme.colors.accent },
  doneButtonColored: { backgroundColor: UiTheme.colors.accent },
});
