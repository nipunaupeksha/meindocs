import { create } from 'zustand';
import type { GeneratedDocument } from '@meindocs/domain';

type GeneratorState = {
  generated: GeneratedDocument[];
  add: (document: GeneratedDocument) => void;
};
export const useDocumentGeneratorStore = create<GeneratorState>((set) => ({
  generated: [],
  add: (document) => set((state) => ({ generated: [document, ...state.generated] })),
}));
