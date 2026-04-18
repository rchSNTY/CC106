import React, { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

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
};

type UserProfileContextType = {
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
  updateProfile: (profile: Partial<UserProfile>) => void;
};

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      updateProfile: (nextProfile: Partial<UserProfile>) => {
        setProfile((current) => ({ ...current, ...nextProfile }));
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
