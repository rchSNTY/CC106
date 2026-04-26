import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ErrorText } from '@/components/ErrorText';
import { useUserProfile } from '@/stores/user-profile';

import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';
import { getApiErrorMessage, uploadAvatar, upsertProfile } from '@/services/backend';

export default function UserProfile() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weight, setWeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { updateProfile } = useUserProfile();

  const validationRules: Record<string, ValidationRule<string>[]> = {
    name: [
      { validate: (val) => val.trim().length > 0, message: 'Name is required' },
      { validate: (val) => val.trim().length >= 2, message: 'Name must be at least 2 characters' },
    ],
    birthday: [
      { validate: (val) => val.trim().length > 0, message: 'Birthday is required' },
      { validate: (val) => /^\d{4}-\d{2}-\d{2}$/.test(val.trim()), message: 'Birthday must be in YYYY-MM-DD format' },
      { validate: (val) => {
        const date = new Date(val.trim());
        return !isNaN(date.getTime()) && date <= new Date();
      }, message: 'Please enter a valid past date' },
    ],
    height: [
      { validate: (val) => val.trim().length > 0, message: 'Height is required' },
      { validate: (val) => !isNaN(Number(val.trim())) && Number(val.trim()) > 0, message: 'Height must be a positive number' },
    ],
    weight: [
      { validate: (val) => val.trim().length > 0, message: 'Weight is required' },
      { validate: (val) => !isNaN(Number(val.trim())) && Number(val.trim()) > 0, message: 'Weight must be a positive number' },
    ],
  };

  const { validateField, validateAll, setFieldTouched, getFieldError } = useFormValidation();

  function calculateAge(birthDateStr: string): string {
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  const handleNameChange = (text: string) => {
    setName(text);
    validateField('name', text, validationRules.name);
  };

  const handleBirthdayChange = (text: string) => {
    setBirthday(text);
    validateField('birthday', text, validationRules.birthday);
    setAge(calculateAge(text));
  };

  const handleHeightChange = (text: string) => {
    setHeight(text);
    validateField('height', text, validationRules.height);
  };

  const handleWeightChange = (text: string) => {
    setWeight(text);
    validateField('weight', text, validationRules.weight);
  };

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

  async function handleDone() {
    const isValid = validateAll({
      name,
      birthday,
      height,
      weight,
    }, validationRules);

    if (!isValid) {
      Alert.alert('Validation Error', 'Please correct the errors above before proceeding.');
      return;
    }

    try {
      setIsSaving(true);

      let nextAvatarUrl = avatarUrl;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        nextAvatarUrl = await uploadAvatar(avatarUrl);
      }

      const payload = {
        avatarUrl: nextAvatarUrl,
        name: name.trim(),
        age: age.trim(),
        birthday: birthday.trim(),
        gender,
        height: height.trim(),
        heightUnit,
        weight: weight.trim(),
        activityLevel: 'Moderate',
        workout: '',
      };

      const savedProfile = await upsertProfile(payload);
      updateProfile(savedProfile);
      router.push('/choices' as Href);
    } catch (error) {
      Alert.alert('Save Failed', getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            <ThemedText style={{ color: UiTheme.colors.surface }}>{avatarUrl ? 'Change photo' : 'Add photo'}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            value={name}
            onChangeText={handleNameChange}
            onBlur={() => setFieldTouched('name')}
            placeholder="Name"
            style={[styles.input, getFieldError('name') && styles.inputError]}
          />
          <ErrorText error={getFieldError('name')} />

          <ThemedText style={styles.label}>Birthday</ThemedText>
          <TextInput
            value={birthday}
            onChangeText={handleBirthdayChange}
            onBlur={() => setFieldTouched('birthday')}
            placeholder="YYYY-MM-DD"
            style={[styles.input, getFieldError('birthday') && styles.inputError]}
          />
          <ErrorText error={getFieldError('birthday')} />

          <ThemedText style={styles.label}>Age</ThemedText>
          <TextInput
            value={age}
            editable={false}
            placeholder="Calculated automatically"
            style={[styles.input, { backgroundColor: UiTheme.colors.surfaceMuted }]}
          />

          <ThemedText style={styles.label}>Gender</ThemedText>
          <View style={styles.genderContainer}>
            {['Male', 'Female'].map((gen) => (
              <TouchableOpacity
                key={gen}
                onPress={() => setGender(gen as 'Male' | 'Female')}
                style={[
                  styles.genderButton,
                  gender === gen && styles.genderButtonSelected,
                ]}
              >
                <ThemedText style={gender === gen ? styles.genderTextSelected : styles.genderText}>
                  {gen}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.label}>Height ({heightUnit})</ThemedText>
          <View style={styles.rowSmall}>
            <TextInput
              value={height}
              onChangeText={handleHeightChange}
              onBlur={() => setFieldTouched('height')}
              placeholder={`Number (${heightUnit})`}
              keyboardType="decimal-pad"
              style={[styles.input, { flex: 1 }, getFieldError('height') && styles.inputError]}
            />
            <TouchableOpacity
              onPress={() => setHeightUnit((v) => (v === 'cm' ? 'ft' : 'cm'))}
              style={[styles.unitButton, { borderColor: tint }]}
            >
              <ThemedText style={{ color: tint }}>{heightUnit}</ThemedText>
            </TouchableOpacity>
          </View>
          <ErrorText error={getFieldError('height')} />

          <ThemedText style={styles.label}>Weight (kg)</ThemedText>
          <TextInput
            value={weight}
            onChangeText={handleWeightChange}
            onBlur={() => setFieldTouched('weight')}
            placeholder="e.g. 70"
            keyboardType="decimal-pad"
            style={[styles.input, getFieldError('weight') && styles.inputError]}
          />
          <ErrorText error={getFieldError('weight')} />

          <TouchableOpacity onPress={handleDone} style={[styles.doneButton, styles.doneButtonColored, isSaving && styles.buttonDisabled]} activeOpacity={0.9} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color={UiTheme.colors.surface} /> : <ThemedText type="defaultSemiBold" style={styles.doneText}>Done</ThemedText>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UiTheme.colors.page },
  scrollContent: { flexGrow: 1, padding: UiTheme.spacing.lg },
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
  activityLevelContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  activityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: UiTheme.radius.sm,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    alignItems: 'center',
    backgroundColor: UiTheme.colors.surface,
  },
  activityButtonSelected: { backgroundColor: UiTheme.colors.accent, borderColor: UiTheme.colors.accent },
  activityText: { color: UiTheme.colors.textPrimary, fontSize: 16 },
  activityTextSelected: { color: UiTheme.colors.surface, fontSize: 16, fontWeight: '600' },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: UiTheme.radius.sm,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
    alignItems: 'center',
    backgroundColor: UiTheme.colors.surface,
  },
  genderButtonSelected: { backgroundColor: UiTheme.colors.accent, borderColor: UiTheme.colors.accent },
  genderText: { color: UiTheme.colors.textPrimary, fontSize: 16 },
  genderTextSelected: { color: UiTheme.colors.surface, fontSize: 16, fontWeight: '600' },
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
  buttonDisabled: { opacity: 0.7 },

  inputError: {
    borderColor: UiTheme.colors.danger,
    borderWidth: 1,
  },

  photoButtonColored: { backgroundColor: UiTheme.colors.accent, borderColor: UiTheme.colors.accent },
  doneButtonColored: { backgroundColor: UiTheme.colors.accent },
});
