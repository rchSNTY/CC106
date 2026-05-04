import { create } from 'zustand';

export type ExploreWorkoutView = 'presets' | 'generated';

type ExploreState = {
  workoutView: ExploreWorkoutView;
  setWorkoutView: (next: ExploreWorkoutView) => void;
};

export const useExploreStore = create<ExploreState>((set) => ({
  workoutView: 'presets',
  setWorkoutView: (next) => set({ workoutView: next }),
}));

