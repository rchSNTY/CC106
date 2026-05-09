import { Slot, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';

import { UiTheme } from '@/constants/ui-theme';
import { SnackbarProvider } from '@/stores/snackbar';
import { UserProfileProvider } from '@/stores/user-profile';

export default function Layout() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const didForceLandingRef = useRef(false);

  useEffect(() => {
    if (!rootNavigationState?.key || didForceLandingRef.current) {
      return;
    }

    didForceLandingRef.current = true;

    const timerA = setTimeout(() => router.replace('/'), 0);
    const timerB = setTimeout(() => router.replace('/'), 250);

    return () => {
      clearTimeout(timerA);
      clearTimeout(timerB);
    };
  }, [rootNavigationState?.key, router]);


  return (
    <UserProfileProvider>
      <SnackbarProvider>
        <StatusBar style="dark" backgroundColor={UiTheme.colors.page} />
        <Slot />
      </SnackbarProvider>
    </UserProfileProvider>
  );
}
