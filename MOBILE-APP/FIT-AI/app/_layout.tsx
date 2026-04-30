import { Slot } from 'expo-router';
import React from 'react';

import { SnackbarProvider } from '@/stores/snackbar';
import { UserProfileProvider } from '@/stores/user-profile';

export default function Layout() {
  // Slot is a placeholder for child routes (like index.tsx, login.tsx, etc.)
  return (
    <UserProfileProvider>
      <SnackbarProvider>
        <Slot />
      </SnackbarProvider>
    </UserProfileProvider>
  );
}
