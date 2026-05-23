import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TurnPlayer {
  id: string;
  name: string;
}

export type TurnOrderMode = "manual" | "auto";

interface TurnKeeperState {
  enabled: boolean;
  players: TurnPlayer[];
  turnOrder: string[]; // player IDs in order
  currentTurnIndex: number;
  mode: TurnOrderMode;
  hasSeenTip: boolean;
}

// ── Storage ───────────────────────────────────────────────────────────────────

const storageKey = (roomCode: string) => `sia_tk_${roomCode}`;

function loadState(roomCode: string): Partial<TurnKeeperState> {
  try {
    const raw = sessionStorage.getItem(storageKey(roomCode));
    return raw ? (JSON.parse(raw) as Partial<TurnKeeperState>) : {};
  } catch {
    return {};
  }
}

function saveState(roomCode: string, state: TurnKeeperState): void {
  try {
    sessionStorage.setItem(storageKey(roomCode), JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTurnKeeper(roomCode: string, privateMode: boolean) {
  const [state, setState] = useState<TurnKeeperState>(() => {
    const saved = loadState(roomCode);
    return {
      enabled: false,
      players: [],
      turnOrder: [],
      currentTurnIndex: 0,
      mode: "manual",
      hasSeenTip: false,
      ...saved,
    };
  });

  const privateModeRef = useRef(privateMode);
  useEffect(() => { privateModeRef.current = privateMode; }, [privateMode]);

  // Stable updater — only depends on roomCode, which never changes for a
  // mounted Room component.
  const persist = useCallback((updater: (prev: TurnKeeperState) => TurnKeeperState) => {
    setState(prev => {
      const next = updater(prev);
      if (!privateModeRef.current) saveState(roomCode, next);
      return next;
    });
  }, [roomCode]);

  // ── Actions (all stable) ──────────────────────────────────────────────────

  const setupTurnKeeper = useCallback(
    (players: TurnPlayer[], order: string[], mode: TurnOrderMode) => {
      persist(() => ({
        enabled: true,
        players,
        turnOrder: order,
        currentTurnIndex: 0,
        mode,
        hasSeenTip: false,
      }));
    },
    [persist],
  );

  const disableTurnKeeper = useCallback(() => {
    persist(prev => ({ ...prev, enabled: false }));
  }, [persist]);

  // Advance to next player (wraps around)
  const advanceTurn = useCallback(() => {
    persist(prev => {
      if (!prev.enabled || prev.turnOrder.length === 0) return prev;
      return {
        ...prev,
        currentTurnIndex: (prev.currentTurnIndex + 1) % prev.turnOrder.length,
      };
    });
  }, [persist]);

  const resetTurns = useCallback(() => {
    persist(prev => ({ ...prev, currentTurnIndex: 0 }));
  }, [persist]);

  const shuffleOrder = useCallback(() => {
    persist(prev => {
      if (prev.turnOrder.length <= 1) return prev;
      const currentId = prev.turnOrder[prev.currentTurnIndex % prev.turnOrder.length];
      const others = prev.turnOrder.filter(id => id !== currentId);
      // Fisher-Yates on everyone except current player
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      // Current player goes last so they don't repeat immediately
      const newOrder = [...others, currentId];
      return { ...prev, turnOrder: newOrder, currentTurnIndex: 0 };
    });
  }, [persist]);

  const editTurnOrder = useCallback(
    (players: TurnPlayer[], order: string[], mode: TurnOrderMode) => {
      persist(prev => ({ ...prev, players, turnOrder: order, mode }));
    },
    [persist],
  );

  const dismissTip = useCallback(() => {
    persist(prev => ({ ...prev, hasSeenTip: true }));
  }, [persist]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const currentPlayer = useMemo<TurnPlayer | null>(() => {
    if (!state.enabled || state.turnOrder.length === 0) return null;
    const id = state.turnOrder[state.currentTurnIndex % state.turnOrder.length];
    return state.players.find(p => p.id === id) ?? null;
  }, [state.enabled, state.turnOrder, state.currentTurnIndex, state.players]);

  const nextPlayer = useMemo<TurnPlayer | null>(() => {
    if (!state.enabled || state.turnOrder.length <= 1) return null;
    const idx = (state.currentTurnIndex + 1) % state.turnOrder.length;
    const id = state.turnOrder[idx];
    return state.players.find(p => p.id === id) ?? null;
  }, [state.enabled, state.turnOrder, state.currentTurnIndex, state.players]);

  return {
    // State
    ...state,
    currentPlayer,
    nextPlayer,
    // Actions
    setupTurnKeeper,
    disableTurnKeeper,
    advanceTurn,
    passTurn: advanceTurn,
    resetTurns,
    shuffleOrder,
    editTurnOrder,
    dismissTip,
  };
}
