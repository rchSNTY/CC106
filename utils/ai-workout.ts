import type { Intensity } from '@/services/backend';
import type { UserProfile } from '@/stores/user-profile';

export type AiWorkoutPreset = {
  intensity: Intensity | 'All';
  search: string;
  title: string;
  subtitle: string;
  isReady: boolean;
};

function normalizeIntensity(level: string): Intensity | 'All' {
  if (level === 'Light' || level === 'Moderate' || level === 'Intense') {
    return level;
  }

  return 'All';
}

export function isAiWorkoutReady(profile: UserProfile): boolean {
  return (
    profile.name.trim() !== 'User Name' &&
    profile.birthday.trim().length > 0 &&
    profile.height.trim().length > 0 &&
    profile.weight.trim().length > 0 &&
    profile.activityLevel.trim().length > 0 &&
    profile.workout.trim().length > 0
  );
}

export function getAiWorkoutPreset(profile: UserProfile): AiWorkoutPreset {
  const isReady = isAiWorkoutReady(profile);
  const intensity = normalizeIntensity(profile.activityLevel.trim());
  const search = profile.workout.trim();

  return {
    intensity,
    search,
    isReady,
    title: isReady ? 'AI Workout Suggestions' : 'Complete Your Profile',
    subtitle: isReady
      ? `Prefill workouts based on ${profile.activityLevel.trim()} ${search.toLowerCase()} training.`
      : 'Add your profile details first so AI suggestions can match your goal.',
  };
}