import React, { JSX } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { UiTheme } from '@/constants/ui-theme'

type ConfirmationModalProps = {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDangerous?: boolean
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmationModalProps): JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.message}>{message}</ThemedText>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.cancelButtonText}>{cancelText}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                isDangerous && styles.dangerousButton,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.confirmButtonText}>{confirmText}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: UiTheme.colors.surface,
    borderRadius: UiTheme.radius.lg,
    paddingVertical: UiTheme.spacing.lg,
    paddingHorizontal: UiTheme.spacing.lg,
    maxWidth: 320,
    width: '85%',
    shadowColor: UiTheme.colors.textPrimary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  content: {
    marginBottom: UiTheme.spacing.lg,
  },
  title: {
    fontSize: UiTheme.font.subtitle,
    fontWeight: '900',
    color: UiTheme.colors.textPrimary,
    marginBottom: UiTheme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: UiTheme.font.body,
    color: UiTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: UiTheme.spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: UiTheme.spacing.sm,
    borderRadius: UiTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: UiTheme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: UiTheme.colors.border,
  },
  cancelButtonText: {
    color: UiTheme.colors.textSecondary,
    fontWeight: '800',
    fontSize: UiTheme.font.body,
  },
  confirmButton: {
    backgroundColor: UiTheme.colors.accent,
  },
  confirmButtonText: {
    color: UiTheme.colors.surface,
    fontWeight: '800',
    fontSize: UiTheme.font.body,
  },
  dangerousButton: {
    backgroundColor: UiTheme.colors.danger,
  },
})
