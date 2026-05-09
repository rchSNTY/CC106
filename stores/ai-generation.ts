import { create } from 'zustand';

type AiGenerationState = {
  isGeneratingAi: boolean;
  startAiGeneration: () => void;
  stopAiGeneration: () => void;
};

export const useAiGenerationStore = create<AiGenerationState>((set) => ({
  isGeneratingAi: false,
  startAiGeneration: () => set({ isGeneratingAi: true }),
  stopAiGeneration: () => set({ isGeneratingAi: false }),
}));
