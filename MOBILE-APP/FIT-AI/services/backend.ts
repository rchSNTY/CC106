import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'fitai_auth_token';
const PROFILE_KEY = 'fitai_profile_cache';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

export type Intensity = 'Light' | 'Moderate' | 'Intense';

export type ApiExercise = {
  id: string;
  name: string;
  detail: string;
  reps?: string;
};

export type ApiWorkout = {
  id: string;
  title: string;
  subtitle: string;
  intensity: Intensity;
  duration: string;
  exercises: ApiExercise[];
};

export type ApiUserProfile = {
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

export type ApiHistoryItem = {
  id: string;
  userId: string;
  workoutId: string;
  date: string;
  duration: string;
  intensity: Intensity;
  notes?: string;
};

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  isFormData?: boolean;
};

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = options.token !== undefined ? options.token : await getAuthToken();
  const headers: Record<string, string> = {};

  if (!options.isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body
      ? options.isFormData
        ? (options.body as BodyInit)
        : JSON.stringify(options.body)
      : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? 'Request failed');
  }

  return data as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function saveProfileCache(profile: ApiUserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getProfileCache(): Promise<ApiUserProfile | null> {
  const value = await AsyncStorage.getItem(PROFILE_KEY);
  return value ? (JSON.parse(value) as ApiUserProfile) : null;
}

export async function clearProfileCache(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{ token: string }> {
  const result = await apiRequest<{ token: string }>('/auth/register', {
    method: 'POST',
    body: payload,
    token: null,
  });
  await setAuthToken(result.token);
  return result;
}

export async function login(payload: { username: string; password: string }): Promise<{ token: string }> {
  const result = await apiRequest<{ token: string }>('/auth/login', {
    method: 'POST',
    body: payload,
    token: null,
  });
  await setAuthToken(result.token);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // no-op
  }
  await clearAuthToken();
  await clearProfileCache();
}

export async function getProfile(): Promise<ApiUserProfile | null> {
  const result = await apiRequest<{ profile: ApiUserProfile | null }>('/profile');
  if (result.profile) {
    await saveProfileCache(result.profile);
  }
  return result.profile;
}

export async function upsertProfile(profile: ApiUserProfile): Promise<ApiUserProfile> {
  const result = await apiRequest<{ profile: ApiUserProfile }>('/profile', {
    method: 'PUT',
    body: profile,
  });
  await saveProfileCache(result.profile);
  return result.profile;
}

export async function uploadAvatar(fileUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', {
    uri: fileUri,
    type: 'image/jpeg',
    name: `avatar-${Date.now()}.jpg`,
  } as unknown as Blob);

  const result = await apiRequest<{ avatarUrl: string }>('/profile/avatar', {
    method: 'POST',
    body: formData,
    isFormData: true,
  });

  return result.avatarUrl;
}

export async function listWorkouts(intensity: 'All' | Intensity, search: string): Promise<ApiWorkout[]> {
  const params = new URLSearchParams();
  if (intensity && intensity !== 'All') {
    params.set('intensity', intensity);
  }
  if (search.trim()) {
    params.set('search', search.trim());
  }

  const query = params.toString();
  const result = await apiRequest<{ workouts: ApiWorkout[] }>(`/workouts${query ? `?${query}` : ''}`, {
    token: null,
  });
  return result.workouts;
}

export async function listFavorites(): Promise<ApiWorkout[]> {
  const result = await apiRequest<{ favorites: ApiWorkout[] }>('/favorites');
  return result.favorites;
}

export async function addFavorite(workoutId: string): Promise<void> {
  await apiRequest(`/favorites/${workoutId}`, { method: 'POST' });
}

export async function removeFavorite(workoutId: string): Promise<void> {
  await apiRequest(`/favorites/${workoutId}`, { method: 'DELETE' });
}

export async function listHistory(): Promise<ApiHistoryItem[]> {
  const result = await apiRequest<{ history: ApiHistoryItem[] }>('/history');
  return result.history;
}

export { ApiError };

