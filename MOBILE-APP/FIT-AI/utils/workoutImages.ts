/**
 * Workout Image Mapping
 * Maps workout IDs to their local image assets
 * All images stored in: assets/images/workouts/
 * Sizing: 120px height for cards, 220px for modal hero image
 */

const workoutImages: Record<string, any> = {
  // Preset workouts (25 total)
  'w-1': require('../assets/images/workouts/MorningMobilityFlow.jpg'),
  'w-2': require('../assets/images/workouts/EnduranceBurn.jpg'),
  'w-3': require('../assets/images/workouts/StrenghtCircuit.jpg'),
  'w-4': require('../assets/images/workouts/CoreStarter.jpg'),
  'w-5': require('../assets/images/workouts/QuickCardioBlast.jpg'),
  'w-6': require('../assets/images/workouts/GentleYogaFlow.jpg'),
  'w-7': require('../assets/images/workouts/UpperBodySculpt.jpg'),
  'w-8': require('../assets/images/workouts/HIITExpress.jpg'),
  'w-9': require('../assets/images/workouts/LowerBodyFocus.jpg'),
  'w-10': require('../assets/images/workouts/ActiveRecovery.jpg'),
  'w-11': require('../assets/images/workouts/FullBodyWeights.jpg'),
  'w-12': require('../assets/images/workouts/CardioEndurance.jpg'),
  'w-13': require('../assets/images/workouts/CoreCrusher.jpg'),
  'w-14': require('../assets/images/workouts/BeginnerWeights.jpg'),
  'w-15': require('../assets/images/workouts/YogaStretch.jpg'),
  'w-16': require('../assets/images/workouts/FatBurningCardio.jpg'),
  'w-17': require('../assets/images/workouts/MuscleBuilding.jpg'),
  'w-18': require('../assets/images/workouts/QuickCore.jpg'),
  'w-19': require('../assets/images/workouts/CardioKickBoxing.jpg'),
  'w-20': require('../assets/images/workouts/FullBodyLight.jpg'),
  'w-21': require('../assets/images/workouts/AdvanceHIIT.jpg'),
  'w-22': require('../assets/images/workouts/FlexibilityFlow.jpg'),
  'w-23': require('../assets/images/workouts/WeightLossFocus.jpg'),
  'w-24': require('../assets/images/workouts/ArmsAndShoulders.jpg'),
  'w-25': require('../assets/images/workouts/EnduranceBuilder.jpg'),
};

/**
 * Get image for a workout
 * @param workoutId - The workout ID (e.g., 'w-1')
 * @returns The image require() or null if not found
 */
export function getWorkoutImage(workoutId: string): any {
  return workoutImages[workoutId] || null;
}

/**
 * Check if workout has a local image
 * @param workoutId - The workout ID
 * @returns True if image exists for this workout
 */
export function hasWorkoutImage(workoutId: string): boolean {
  return workoutId in workoutImages;
}

export default workoutImages;
