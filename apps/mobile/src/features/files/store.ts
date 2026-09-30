import { create } from 'zustand';
import type { LocalFileRecord } from './local-file-service';
import type { DocumentDraft } from './processing-pipeline';

type FileWorkflowState = {
  pending: LocalFileRecord | null;
  draft: DocumentDraft | null;
  isBusy: boolean;
  error: string | null;
  setBusy: (value: boolean) => void;
  setPending: (file: LocalFileRecord | null) => void;
  setDraft: (draft: DocumentDraft | null) => void;
  setError: (value: string | null) => void;
  reset: () => void;
};

export const useFileWorkflowStore = create<FileWorkflowState>((set) => ({
  pending: null,
  draft: null,
  isBusy: false,
  error: null,
  setBusy: (isBusy) => set({ isBusy }),
  setPending: (pending) => set({ pending, draft: null, error: null }),
  setDraft: (draft) => set({ draft, error: null }),
  setError: (error) => set({ error, isBusy: false }),
  reset: () => set({ pending: null, draft: null, isBusy: false, error: null }),
}));
