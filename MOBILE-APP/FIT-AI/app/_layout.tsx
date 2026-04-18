import { Slot } from 'expo-router';
import React from 'react';

import { UserProfileProvider } from '@/stores/user-profile';

export default function Layout() {
  // Slot is a placeholder for child routes (like index.tsx, login.tsx, etc.)
  return (
    <UserProfileProvider>
      <Slot />
    </UserProfileProvider>
  );
}
