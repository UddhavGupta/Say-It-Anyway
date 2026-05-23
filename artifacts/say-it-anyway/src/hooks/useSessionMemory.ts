import { useState, useCallback } from "react";
import { WORTH_REVISITING_KEY, PRIVATE_MODE_KEY } from "@/lib/constants";

// ── Shared types ─────────────────────────────────────────────────────────────

export interface PlayedCard {
  cardId: string;
  prompt: string;
  mode: string;
  levelName: string;
  relationshipContext: string;
  playedAt: number;
}

export interface SavedCard {
  cardId: string;
  prompt: string;
  mode: string;
  levelName: string;
  relationshipContext: string;
  savedAt: number;
}

// ── Local helpers ─────────────────────────────────────────────────────────────

function loadWorthRevisiting(): SavedCard[] {
  try {
    const raw = localStorage.getItem(WORTH_REVISITING_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedCard[];
  } catch {
    return [];
  }
}

function persistWorthRevisiting(cards: SavedCard[]): void {
  try {
    localStorage.setItem(WORTH_REVISITING_KEY, JSON.stringify(cards));
  } catch {
    // ignore storage quota errors
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSessionMemory() {
  // Private mode — persisted
  const [privateMode, setPrivateMode] = useState(
    () => localStorage.getItem(PRIVATE_MODE_KEY) === "true",
  );

  // Recently played — in-memory only, session-scoped, max 15
  const [recentlyPlayed, setRecentlyPlayed] = useState<PlayedCard[]>([]);

  // Worth Revisiting — persisted to localStorage (unless private mode)
  const [worthRevisiting, setWorthRevisiting] = useState<SavedCard[]>(() =>
    localStorage.getItem(PRIVATE_MODE_KEY) === "true" ? [] : loadWorthRevisiting(),
  );

  // Not for this room — in-memory Set, session-scoped
  const [notForThisRoom, setNotForThisRoom] = useState<Set<string>>(new Set());

  // Modes used this session (for End Session summary)
  const [sessionModesUsed, setSessionModesUsed] = useState<Set<string>>(new Set());

  // ── Tracking ──────────────────────────────────────────────────────────────

  const trackCard = useCallback((card: PlayedCard) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(c => c.cardId !== card.cardId);
      return [card, ...filtered].slice(0, 15);
    });
  }, []);

  const trackMode = useCallback((mode: string) => {
    setSessionModesUsed(prev => {
      if (prev.has(mode)) return prev;
      return new Set([...prev, mode]);
    });
  }, []);

  // ── Worth Revisiting ─────────────────────────────────────────────────────

  /**
   * Returns "saved" | "already_saved" | "private_mode"
   */
  const saveForLater = useCallback((card: SavedCard): "saved" | "already_saved" | "private_mode" => {
    if (localStorage.getItem(PRIVATE_MODE_KEY) === "true") return "private_mode";
    const current = loadWorthRevisiting();
    if (current.some(c => c.cardId === card.cardId)) return "already_saved";
    const updated = [card, ...current];
    persistWorthRevisiting(updated);
    setWorthRevisiting(updated);
    return "saved";
  }, []);

  const removeFromWorthRevisiting = useCallback((cardId: string) => {
    const current = loadWorthRevisiting();
    const updated = current.filter(c => c.cardId !== cardId);
    persistWorthRevisiting(updated);
    setWorthRevisiting(updated);
  }, []);

  // ── Not for this room ────────────────────────────────────────────────────

  const markNotForThisRoom = useCallback((cardId: string) => {
    setNotForThisRoom(prev => new Set([...prev, cardId]));
  }, []);

  // ── Private mode ─────────────────────────────────────────────────────────

  const togglePrivateMode = useCallback((enabled: boolean) => {
    setPrivateMode(enabled);
    localStorage.setItem(PRIVATE_MODE_KEY, String(enabled));
    if (enabled) {
      localStorage.removeItem(WORTH_REVISITING_KEY);
      setWorthRevisiting([]);
    }
  }, []);

  // ── Clearing ─────────────────────────────────────────────────────────────

  const clearRecentlyPlayed = useCallback(() => setRecentlyPlayed([]), []);

  const clearWorthRevisiting = useCallback(() => {
    setWorthRevisiting([]);
    localStorage.removeItem(WORTH_REVISITING_KEY);
  }, []);

  const clearSession = useCallback(() => {
    setRecentlyPlayed([]);
    setNotForThisRoom(new Set());
    setSessionModesUsed(new Set());
  }, []);

  const clearAllData = useCallback(() => {
    setRecentlyPlayed([]);
    setNotForThisRoom(new Set());
    setWorthRevisiting([]);
    setSessionModesUsed(new Set());
    setPrivateMode(false);
    localStorage.removeItem(WORTH_REVISITING_KEY);
    localStorage.removeItem(PRIVATE_MODE_KEY);
  }, []);

  // ── Return ───────────────────────────────────────────────────────────────

  return {
    // State
    privateMode,
    recentlyPlayed,
    worthRevisiting,
    notForThisRoom,
    sessionModesUsed,
    // Tracking
    trackCard,
    trackMode,
    // Worth Revisiting
    saveForLater,
    removeFromWorthRevisiting,
    // Not for this room
    markNotForThisRoom,
    // Private mode
    togglePrivateMode,
    // Clearing
    clearRecentlyPlayed,
    clearWorthRevisiting,
    clearSession,
    clearAllData,
  };
}
