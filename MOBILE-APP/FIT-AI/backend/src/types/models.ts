import { ObjectId } from 'mongodb';

export type ActivityLevel = 'Light' | 'Moderate' | 'Intense';

export type WorkoutType = 'Cardio' | 'Bodyweight' | 'Weight';

export type Intensity = 'Light' | 'Moderate' | 'Intense';

export type Exercise = {
  id: string;
  name: string;
  detail: string;
  reps: string;
};

export type Workout = {
  _id?: ObjectId;
  id: string;
  title: string;
  subtitle: string;
  intensity: Intensity;
  duration: string;
  exercises: Exercise[];
};

export type UserProfile = {
  avatarUrl: string | null;
  name: string;
  age: string;
  birthday: string;
  gender: string;
  height: string;
  heightUnit: 'cm' | 'ft';
  weight: string;
  activityLevel: ActivityLevel;
  workout: WorkoutType | '';
};

export type User = {
  _id?: ObjectId;
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type Favorite = {
  _id?: ObjectId;
  id: string;
  userId: string;
  workoutId: string;
  createdAt: string;
};

export type HistoryItem = {
  _id?: ObjectId;
  id: string;
  userId: string;
  workoutId: string;
  date: string;
  duration: string;
  intensity: Intensity;
  notes?: string;
};

export type UserProfileRecord = {
  _id?: ObjectId;
  userId: string;
  profile: UserProfile;
  updatedAt: string;
};

export type DatabaseSchema = {
  users: User[];
  userProfiles: UserProfileRecord[];
  workouts: Workout[];
  favorites: Favorite[];
  history: HistoryItem[];
};
