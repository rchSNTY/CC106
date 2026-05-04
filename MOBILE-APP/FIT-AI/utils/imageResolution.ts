/**
 * Workout Image Resolution Helper
 * Integrates backend coverImageUrl with frontend local images
 */

import { ImageSourcePropType } from 'react-native';
import { getWorkoutImage } from './workoutImages';

export interface WorkoutWithImage {
  id?: string | number;
  coverImageUrl?: string;
  [key: string]: any;
}

/**
 * Resolves a workout's cover image from backend data
 * @param workout - Workout object from backend with optional coverImageUrl
 * @returns Image source for require() or null if not found
 */
export function resolveWorkoutImage(workout: WorkoutWithImage): ImageSourcePropType | undefined {
  if (!workout) return undefined;
  
  // For preset workouts, use the ID-based mapping
  if (workout.id) {
    const id = String(workout.id);
    if (id.startsWith('w-')) {
      const presetImage = getWorkoutImage(id);
      if (presetImage) {
        return presetImage;
      }
    }
  }
  
  // For AI-generated workouts, coverImageUrl will be a Pexels URL
  if (workout.coverImageUrl && (workout.coverImageUrl.includes('pexels') || workout.coverImageUrl.startsWith('http'))) {
    return { uri: workout.coverImageUrl };
  }
  
  return undefined;
}

/**
 * Check if a workout has a cover image
 * @param workout - Workout object
 * @returns Boolean indicating if image is available
 */
export function hasWorkoutCoverImage(workout: WorkoutWithImage): boolean {
  return resolveWorkoutImage(workout) !== undefined;
}
