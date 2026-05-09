import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { JSX, useEffect, useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UiTheme } from '@/constants/ui-theme';

type SupportContactModalProps = {
  visible: boolean;
  onClose: () => void;
  name: string;
  email: string;
  phone: string;
  github?: string;
  linkedin?: string;
};

type CopyField = 'email' | 'phone' | 'github' | 'linkedin' | null;

export default function SupportContactModal({ visible, onClose, name, email, phone, github, linkedin }: SupportContactModalProps): JSX.Element {
  const [copiedField, setCopiedField] = useState<CopyField>(null);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  useEffect(() => {
    if (!visible) setCopiedField(null);
  }, [visible]);

  useEffect(() => {
    if (!copiedField) return;
    const t = setTimeout(() => setCopiedField(null), 1200);
    return () => clearTimeout(t);
  }, [copiedField]);

  const handleCopy = async (value: string, field: Exclude<CopyField, null>) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    setCopiedField(field);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <ThemedText type="title" style={styles.title}>Contact Developer</ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.iconButton} accessibilityLabel="Close" activeOpacity={0.8}>
                <Ionicons name="close" size={20} color={UiTheme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.subtitle}>Use the details below to reach the developer directly.</ThemedText>

            <View style={styles.detailGroup}>
              <View style={styles.fieldCard}>
                <Text style={[styles.label, { fontSize: isSmallScreen ? 12 : 13 }]}>Name:</Text>
                <Text style={[styles.value, { fontSize: isSmallScreen ? 11 : 12, lineHeight: isSmallScreen ? 16 : 18 }]}>{name}</Text>
              </View>

              <View style={styles.fieldCard}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { fontSize: isSmallScreen ? 12 : 13, flex: 1 }]}>Email:</Text>
                  <TouchableOpacity onPress={() => void handleCopy(email, 'email')} style={styles.iconButton} activeOpacity={0.7}>
                    <Ionicons name={copiedField === 'email' ? 'checkmark-done' : 'copy'} size={16} color={UiTheme.colors.accent} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.value, { fontSize: isSmallScreen ? 11 : 12, lineHeight: isSmallScreen ? 16 : 18 }]}>{email}</Text>
              </View>

              <View style={styles.fieldCard}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { fontSize: isSmallScreen ? 12 : 13, flex: 1 }]}>Phone No.:</Text>
                  <TouchableOpacity onPress={() => void handleCopy(phone, 'phone')} style={styles.iconButton} activeOpacity={0.7}>
                    <Ionicons name={copiedField === 'phone' ? 'checkmark-done' : 'copy'} size={16} color={UiTheme.colors.accent} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.value, { fontSize: isSmallScreen ? 11 : 12, lineHeight: isSmallScreen ? 16 : 18 }]}>{phone}</Text>
              </View>

              <View style={styles.fieldCard}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { fontSize: isSmallScreen ? 12 : 13, flex: 1 }]}>GitHub:</Text>
                  <TouchableOpacity onPress={() => void handleCopy(github || '', 'github')} style={styles.iconButton} activeOpacity={0.7} disabled={!github}>
                    <Ionicons name={copiedField === 'github' ? 'checkmark-done' : 'copy'} size={16} color={UiTheme.colors.accent} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.value, { fontSize: isSmallScreen ? 11 : 12, lineHeight: isSmallScreen ? 16 : 18 }]}>{github ?? 'github.com/your-username'}</Text>
              </View>

              <View style={styles.fieldCard}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { fontSize: isSmallScreen ? 12 : 13, flex: 1 }]}>LinkedIn:</Text>
                  <TouchableOpacity onPress={() => void handleCopy(linkedin || '', 'linkedin')} style={styles.iconButton} activeOpacity={0.7} disabled={!linkedin}>
                    <Ionicons name={copiedField === 'linkedin' ? 'checkmark-done' : 'copy'} size={16} color={UiTheme.colors.accent} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.value, { fontSize: isSmallScreen ? 11 : 12, lineHeight: isSmallScreen ? 16 : 18 }]}>{linkedin ?? 'linkedin.com/in/your-profile'}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 51, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: UiTheme.spacing.lg,
  },
  safeArea: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.xl,
    padding: UiTheme.spacing.lg,
    width: '100%',
    gap: UiTheme.spacing.md,
    shadowColor: UiTheme.colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: UiTheme.spacing.md,
  },
  title: { color: UiTheme.colors.textPrimary, fontSize: UiTheme.font.subtitle, fontWeight: '900' },
  subtitle: { color: UiTheme.colors.textSecondary, fontSize: UiTheme.font.body, marginTop: 4, lineHeight: 20 },
  iconButton: { padding: UiTheme.spacing.xs, justifyContent: 'center', alignItems: 'center' },

  detailGroup: { gap: UiTheme.spacing.md },
  fieldCard: { gap: UiTheme.spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: UiTheme.spacing.sm },
  label: { color: UiTheme.colors.textPrimary, fontWeight: '800' },
  value: { color: UiTheme.colors.textSecondary },
});
