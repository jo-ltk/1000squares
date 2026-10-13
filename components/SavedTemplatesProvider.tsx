'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type SavedTemplatesContextValue = {
  savedIds: string[];
  toggleSaved: (id: string) => void;
};

const STORAGE_KEY = '1000squares:saved-template-ids';
const DEFAULT_SAVED_IDS = ['midnight-vows', 'rose-garden-suite', 'sunset-ticket', 'ring-ceremony'];
const SavedTemplatesContext = createContext<SavedTemplatesContextValue | null>(null);

export function SavedTemplatesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(DEFAULT_SAVED_IDS);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((id): id is string => typeof id === 'string')) {
          setSavedIds(parsed);
        }
      }
    } catch {
      // Keep the sample defaults if local storage is unavailable or malformed.
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Saving remains available for this session when browser storage is disabled.
    }
  }, [savedIds, storageReady]);

  const toggleSaved = (id: string) => {
    setSavedIds((current) => current.includes(id)
      ? current.filter((savedId) => savedId !== id)
      : [...current, id]);
  };

  return (
    <SavedTemplatesContext.Provider value={{ savedIds, toggleSaved }}>
      {children}
    </SavedTemplatesContext.Provider>
  );
}

export function useSavedTemplates() {
  const context = useContext(SavedTemplatesContext);
  if (!context) throw new Error('useSavedTemplates must be used inside SavedTemplatesProvider.');
  return context;
}

