import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { UiTheme } from '@/constants/ui-theme';

interface ErrorTextProps {
  error?: string;
}

export function ErrorText({ error }: ErrorTextProps) {
  if (!error) return null;
  return <Text style={styles.errorText}>{error}</Text>;
}

const styles = StyleSheet.create({
  errorText: {
    color: UiTheme.colors.danger,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
});
