import React, { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { getProfileCache, saveProfileCache } from '@/services/backend';

export type UserProfile = {
  avatarUrl: string | null;
  name: string;
  age: string;
  birthday: string;
  gender: string;
  height: string;
  heightUnit: 'cm' | 'ft';
  weight: string;
  activityLevel: string;
  workout: string;
  weeklyGoal: number;
};

const defaultProfile: UserProfile = {
  avatarUrl: null,
  name: 'User Name',
  age: '',
  birthday: '',
  gender: '',
  height: '',
  heightUnit: 'cm',
  weight: '',
  activityLevel: 'Moderate',
  workout: '',
  weeklyGoal: 5,
};

type UserProfileContextType = {
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  resetProfile: () => void;
};

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);

  const normalizeProfile = (nextProfile: Partial<UserProfile>): UserProfile => ({
    ...defaultProfile,
    ...nextProfile,
    weeklyGoal:
      typeof nextProfile.weeklyGoal === 'number' && Number.isFinite(nextProfile.weeklyGoal) && nextProfile.weeklyGoal > 0
        ? Math.round(nextProfile.weeklyGoal)
        : defaultProfile.weeklyGoal,
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const cached = await getProfileCache();
      if (!isMounted || !cached) {
        return;
      }

      setProfileState(normalizeProfile(cached));
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void saveProfileCache(profile);
  }, [profile]);

  const setProfile: Dispatch<SetStateAction<UserProfile>> = (nextProfile) => {
    setProfileState((current) => {
      const resolved = typeof nextProfile === 'function' ? nextProfile(current) : nextProfile;
      return normalizeProfile(resolved);
    });
  };

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      updateProfile: (nextProfile: Partial<UserProfile>) => {
        setProfile((current) => normalizeProfile({ ...current, ...nextProfile }));
      },
      resetProfile: () => {
        setProfileState(defaultProfile);
      },
    }),
    [profile],
  );

  return React.createElement(UserProfileContext.Provider, { value }, children);
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
