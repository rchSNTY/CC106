import { env } from '../config/env';
import { getFavoritesCollection, getWorkoutsCollection } from '../repositories/collections';
import type { Exercise, Intensity, Workout } from '../types/models';
import { HttpError } from '../utils/errors';
import { createId } from '../utils/id';

// OpenRouter API types
interface OpenRouterMessage {
  role: 'system' | 'user';
  content: string;
}

interface OpenRouterChoice {
  message: {
    content: string;
  };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

// Pexels API types
interface PexelsPhoto {
  id: number;
  photographer: string;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  next_page?: string;
}

// User profile for AI generation
export interface AiWorkoutRequest {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  workout: string;
  weeklyGoal: number;
}

// AI-generated workout structure
interface GeneratedExercise {
  name: string;
  detail: string;
  reps: string;
  steps: string[];
}

interface GeneratedWorkout {
  title: string;
  subtitle: string;
  intensity: string;
  duration: string;
  exercises: GeneratedExercise[];
}

interface GeneratedWorkoutBundle {
  workouts: GeneratedWorkout[];
}

// System prompt for AI
const SYSTEM_PROMPT = `You are a fitness expert AI that generates personalized workout routines.
Generate a workout based on the user's profile information.

Output ONLY valid JSON in this exact format:
{
  "workouts": [
    {
      "title": "Workout Name",
      "subtitle": "Cardio|Bodyweight|Weights",
      "intensity": "Light|Moderate|Intense",
      "duration": "X min",
      "exercises": [
        {
          "name": "Exercise name",
          "detail": "Brief description",
          "reps": "8 reps or 30 sec",
          "steps": ["Step 1", "Step 2", "Step 3"]
        }
      ]
    }
  ]
}

Consider the user's:
- Activity level (Light/Moderate/Intense) for intensity
- Preferred workout type (Cardio/Bodyweight/Weights) for subtitle
- Age and fitness level when choosing exercises
- Weekly goal to determine appropriate duration

Generate exactly 3 distinct workouts in one response.
Generate 3-5 exercises per workout. Keep exercises appropriate for the user's profile.

Important: every exercise must include a "steps" array with 3-5 clear, practical instructions that explain how to perform the movement safely and correctly.`;

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = env.openrouterApiKey;
  
  if (!apiKey) {
    throw new HttpError(503, 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.');
  }

  const model = env.openrouterModel;

  console.log(`🤖 Calling OpenRouter with model: ${model}`);

  try {
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    console.log('📤 OpenRouter Request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': env.baseUrl,
        'X-Title': 'FIT-AI Workout Generator',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📬 OpenRouter Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData: any = {};
      let responseText = '';

      try {
        responseText = await response.text();
        console.log(`📥 OpenRouter Error Response Text: ${responseText}`);
        
        if (responseText) {
          errorData = JSON.parse(responseText);
          console.log('📥 OpenRouter Error Data:', JSON.stringify(errorData, null, 2));
        }
      } catch (parseError) {
        console.log('⚠️ Failed to parse OpenRouter error response:', parseError);
      }

      // Build detailed error message
      let errorMessage = `OpenRouter API error (${response.status} ${response.statusText})`;
      
      if (errorData?.error?.message) {
        errorMessage = `OpenRouter: ${errorData.error.message}`;
      } else if (errorData?.error?.code) {
        errorMessage = `OpenRouter: ${errorData.error.code}`;
        if (errorData.error.message) {
          errorMessage += ` - ${errorData.error.message}`;
        }
      } else if (responseText) {
        errorMessage = `OpenRouter: ${responseText}`;
      }

      console.log(`❌ Final Error Message: ${errorMessage}`);
      throw new HttpError(response.status, errorMessage);
    }

    const data: OpenRouterResponse = await response.json();
    console.log('✅ OpenRouter Response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || data.choices.length === 0) {
      throw new HttpError(500, 'No response from OpenRouter - empty choices array');
    }

    return data.choices[0].message.content;
  } catch (error) {
    // Re-throw HttpError as-is
    if (error instanceof HttpError) {
      console.log('HttpError thrown:', error.message);
      throw error;
    }

    // Catch network or parse errors
    const err = error as Error;
    console.log('Network/Parse Error:', err.message);
    throw new HttpError(502, `OpenRouter request failed: ${err.message}`);
  }
}

function buildUserPrompt(profile: AiWorkoutRequest): string {
  return `
Generate a personalized workout for this user:
- Name: ${profile.name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height}
- Weight: ${profile.weight}
- Activity Level: ${profile.activityLevel}
- Preferred Workout Type: ${profile.workout}
- Weekly Goal: ${profile.weeklyGoal} workouts per week

Generate a workout that matches their activity level and workout preferences.
`;
}

async function fetchWorkoutImage(query: string): Promise<string | undefined> {
  const apiKey = env.pexelsApiKey;
  
  if (!apiKey) {
    console.log('⚠️ Pexels API key not configured, skipping image fetch');
    return undefined;
  }

  try {
    const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    
    console.log(`📷 Fetching Pexels image for: ${query}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      console.log(`⚠️ Pexels API error (${response.status}): Failed to fetch image for "${query}"`);
      return undefined;
    }

    const data: PexelsSearchResponse = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      const imageUrl = data.photos[0].src.landscape || data.photos[0].src.large;
      console.log(`✅ Found Pexels image: ${imageUrl}`);
      return imageUrl;
    }

    console.log(`⚠️ No Pexels images found for "${query}"`);
    return undefined;
  } catch (error) {
    const err = error as Error;
    console.log(`⚠️ Error fetching Pexels image: ${err.message}`);
    return undefined;
  }
}

function parseAIResponse(response: string): GeneratedWorkout[] {
  // Extract JSON from response (in case there's any extra text)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new HttpError(502, 'AI response did not contain valid JSON. Please try again.');
  }

  let parsed: GeneratedWorkoutBundle;
  try {
    parsed = JSON.parse(jsonMatch[0]) as GeneratedWorkoutBundle;
  } catch (error) {
    throw new HttpError(502, 'Failed to parse AI response as JSON. Please try again.');
  }

  if (!Array.isArray(parsed.workouts) || parsed.workouts.length !== 3) {
    throw new HttpError(502, 'AI response must include exactly 3 workouts. Please try again.');
  }

  for (const workout of parsed.workouts) {
    // Validate required fields
    if (!workout.title || !workout.subtitle || !workout.intensity || !workout.duration || !workout.exercises) {
      throw new HttpError(502, 'AI response missing required workout fields. Please try again.');
    }

    // Validate exercises
    if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
      throw new HttpError(502, 'AI response must contain at least one exercise. Please try again.');
    }

    for (const exercise of workout.exercises) {
      if (!Array.isArray(exercise.steps) || exercise.steps.length === 0) {
        throw new HttpError(502, 'AI response must include steps for each exercise. Please try again.');
      }
    }
  }

  return parsed.workouts;
}

function convertToWorkout(generated: GeneratedWorkout): Workout {
  const exercises: Exercise[] = generated.exercises.map((ex) => ({
    id: createId('e'),
    name: ex.name,
    detail: ex.detail,
    reps: ex.reps,
    steps: ex.steps,
  }));

  return {
    id: createId('w'),
    title: generated.title,
    subtitle: generated.subtitle,
    intensity: generated.intensity as Intensity,
    duration: generated.duration,
    exercises,
    source: 'ai',
  };
}

async function convertToWorkoutWithImage(generated: GeneratedWorkout): Promise<Workout> {
  const exercises: Exercise[] = generated.exercises.map((ex) => ({
    id: createId('e'),
    name: ex.name,
    detail: ex.detail,
    reps: ex.reps,
    steps: ex.steps,
  }));

  // Fetch cover image from Pexels
  const coverImageUrl = await fetchWorkoutImage(generated.title);

  return {
    id: createId('w'),
    title: generated.title,
    subtitle: generated.subtitle,
    intensity: generated.intensity as Intensity,
    duration: generated.duration,
    exercises,
    coverImageUrl,
    source: 'ai',
  };
}

function isGeneratedWorkoutId(workoutId: string): boolean {
  return /^w-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workoutId);
}

export async function deleteGeneratedAiWorkouts(): Promise<number> {
  const workoutsCollection = getWorkoutsCollection();
  const favoritesCollection = getFavoritesCollection();

  const generatedWorkouts = await workoutsCollection.find({
    $or: [{ source: 'ai' }, { id: { $regex: /^w-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i } }],
  }).toArray();

  const generatedIds = generatedWorkouts.map((workout) => workout.id).filter(isGeneratedWorkoutId);

  if (generatedIds.length === 0) {
    return 0;
  }

  await Promise.all([
    workoutsCollection.deleteMany({ id: { $in: generatedIds } }),
    favoritesCollection.deleteMany({ workoutId: { $in: generatedIds } }),
  ]);

  return generatedIds.length;
}

export async function listGeneratedAiWorkouts(): Promise<Workout[]> {
  const workoutsCollection = getWorkoutsCollection();
  const workouts = await workoutsCollection.find({
    $or: [
      { source: 'ai' },
      { id: { $regex: /^w-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i } },
    ],
  }).toArray();
  return workouts;
}

export async function generateAiWorkout(profile: AiWorkoutRequest, userId?: string): Promise<Workout[]> {
  // Build prompt from user profile
  const userPrompt = buildUserPrompt(profile);
  
  // Call OpenRouter
  const aiResponse = await callOpenRouter(userPrompt);
  
  // Parse and validate response
  const generatedWorkouts = parseAIResponse(aiResponse);
  
  // Convert to our Workout type with Pexels images
  const workouts = await Promise.all(
    generatedWorkouts.map((generatedWorkout) => convertToWorkoutWithImage(generatedWorkout))
  );

  // Persist the generated workout so it can be favorited later.
  const workoutsCollection = getWorkoutsCollection();
  await workoutsCollection.insertMany(workouts);
  
  return workouts;
}

export async function getAiServiceStatus(): Promise<{ available: boolean; message: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return {
      available: false,
      message: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable.',
    };
  }

  return {
    available: true,
    message: 'AI service is ready',
  };
}
