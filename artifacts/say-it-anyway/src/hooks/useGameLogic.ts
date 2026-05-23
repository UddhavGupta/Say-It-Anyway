import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import {
  useGetRoom,
  useUpdateRoomState,
  useRecordCardHistory,
  getGetRoomQueryKey
} from "@workspace/api-client-react";
import { cards, Card } from "@/data/cardData";

// ---------------------------------------------------------------------------
// Pure helpers (outside hook — no closure captures)
// ---------------------------------------------------------------------------

function computeFilteredDeck(mode: string, level: number, filter: string): Card[] {
  return cards.filter(card => {
    if (card.mode !== mode) return false;
    if (mode !== "after_dark" && (card.is_hidden || card.is_adult)) return false;
    if (mode === "classic") return card.level === level;
    if (mode === "long_game") {
      if (
        filter !== "all" &&
        card.relationship_context !== filter &&
        card.relationship_context !== "all"
      ) return false;
      return true;
    }
    return true; // after_dark
  });
}

function buildShuffledDeck(deck: Card[]): string[] {
  const ids = deck.map(c => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGameLogic(roomCode: string) {
  const { data: room, isLoading } = useGetRoom(roomCode, {
    query: {
      refetchInterval: 2000,
      enabled: !!roomCode,
      queryKey: getGetRoomQueryKey(roomCode)
    }
  });

  const { mutate: updateRoom } = useUpdateRoomState();
  const { mutate: recordCard } = useRecordCardHistory();

  // Keep mutate stable across re-renders so callbacks below never go stale
  const updateRoomRef = useRef(updateRoom);
  const recordCardRef = useRef(recordCard);
  useEffect(() => { updateRoomRef.current = updateRoom; });
  useEffect(() => { recordCardRef.current = recordCard; });

  // ── Server state ──────────────────────────────────────────────────────────
  const serverMode        = room?.activeMode               ?? "classic";
  const serverLevel       = room?.activeLevel              ?? 1;
  const serverFilter      = room?.activeRelationshipFilter ?? "all";
  const serverCardIndex   = room?.currentCardIndex         ?? 0;
  const serverCardId      = room?.currentCardId            ?? null;
  const serverDeckOrder   = room?.shuffledDeckOrder        ?? [];

  // ── Optimistic overrides ──────────────────────────────────────────────────
  // Set immediately on every user action; cleared when the server confirms.
  const [optMode,   setOptMode]   = useState<string | null>(null);
  const [optLevel,  setOptLevel]  = useState<number | null>(null);
  const [optFilter, setOptFilter] = useState<string | null>(null);
  const [optIndex,  setOptIndex]  = useState<number | null>(null);
  const [optCardId, setOptCardId] = useState<string | null>(null);

  // Safety-net timeout so stale optimistic state never gets stuck
  const clearOptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleOptClear = useCallback(() => {
    if (clearOptTimer.current) clearTimeout(clearOptTimer.current);
    clearOptTimer.current = setTimeout(() => {
      setOptIndex(null);
      setOptCardId(null);
    }, 5000);
  }, []);

  // Clear card optimistic once server confirms the write
  useEffect(() => {
    if (optIndex !== null && serverCardIndex === optIndex) {
      setOptIndex(null);
      setOptCardId(null);
    }
  }, [serverCardIndex, optIndex]);

  // Clear mode/level/filter optimistic once server confirms
  useEffect(() => {
    if (optMode   !== null && serverMode   === optMode)   setOptMode(null);
    if (optLevel  !== null && serverLevel  === optLevel)  setOptLevel(null);
    if (optFilter !== null && serverFilter === optFilter) setOptFilter(null);
  }, [serverMode, serverLevel, serverFilter, optMode, optLevel, optFilter]);

  // ── Resolved values (optimistic wins) ────────────────────────────────────
  const activeMode              = optMode   ?? serverMode;
  const activeLevel             = optLevel  ?? serverLevel;
  const activeRelationshipFilter = optFilter ?? serverFilter;
  const currentCardIndex        = optIndex  ?? serverCardIndex;
  const currentCardId           = optCardId ?? serverCardId;

  // We always navigate using the server's deck order (the order is not
  // optimistically changed, only the index within it is).
  const shuffledDeckOrder = serverDeckOrder;

  // ── One-time deck initialisation (server has empty deck) ─────────────────
  // Mode/level/filter changes now send the new deck in one shot, so this
  // only fires for a brand-new room or after a hard reset.
  const initializedRef = useRef<string>("");

  useEffect(() => {
    if (!room || !roomCode) return;
    const stateKey = `${serverMode}-${serverLevel}-${serverFilter}`;
    if (shuffledDeckOrder.length === 0 && initializedRef.current !== stateKey) {
      const deck = computeFilteredDeck(serverMode, serverLevel, serverFilter);
      if (deck.length === 0) return;
      initializedRef.current = stateKey;
      const newOrder = buildShuffledDeck(deck);
      updateRoomRef.current({
        code: roomCode,
        data: { shuffledDeckOrder: newOrder, currentCardIndex: 0, currentCardId: newOrder[0] ?? null }
      });
    }
  }, [room, roomCode, serverMode, serverLevel, serverFilter, shuffledDeckOrder.length]);

  // ── Derived card ──────────────────────────────────────────────────────────
  const currentCard = useMemo(() => {
    if (!currentCardId) return null;
    return cards.find(c => c.id === currentCardId) ?? null;
  }, [currentCardId]);

  // ── Actions ───────────────────────────────────────────────────────────────
  // All actions:
  //  1. Apply optimistic state immediately (instant UI response)
  //  2. Fire PATCH in background (keeps server + other players in sync)

  const changeMode = (mode: string) => {
    const level  = optLevel  ?? serverLevel;
    const filter = optFilter ?? serverFilter;
    const deck   = computeFilteredDeck(mode, level, filter);
    const order  = buildShuffledDeck(deck);
    const firstId = order[0] ?? null;

    // Optimistic
    setOptMode(mode);
    setOptIndex(0);
    setOptCardId(firstId);
    scheduleOptClear();

    // Single PATCH — deck included so no second round-trip
    initializedRef.current = `${mode}-${level}-${filter}`;
    updateRoomRef.current({
      code: roomCode,
      data: { activeMode: mode, shuffledDeckOrder: order, currentCardIndex: 0, currentCardId: firstId }
    });
  };

  const changeLevel = (level: number) => {
    const mode   = optMode   ?? serverMode;
    const filter = optFilter ?? serverFilter;
    const deck   = computeFilteredDeck(mode, level, filter);
    const order  = buildShuffledDeck(deck);
    const firstId = order[0] ?? null;

    setOptLevel(level);
    setOptIndex(0);
    setOptCardId(firstId);
    scheduleOptClear();

    initializedRef.current = `${mode}-${level}-${filter}`;
    updateRoomRef.current({
      code: roomCode,
      data: { activeLevel: level, shuffledDeckOrder: order, currentCardIndex: 0, currentCardId: firstId }
    });
  };

  const changeRelationshipFilter = (filter: string) => {
    const mode  = optMode  ?? serverMode;
    const level = optLevel ?? serverLevel;
    const deck  = computeFilteredDeck(mode, level, filter);
    const order = buildShuffledDeck(deck);
    const firstId = order[0] ?? null;

    setOptFilter(filter);
    setOptIndex(0);
    setOptCardId(firstId);
    scheduleOptClear();

    initializedRef.current = `${mode}-${level}-${filter}`;
    updateRoomRef.current({
      code: roomCode,
      data: { activeRelationshipFilter: filter, shuffledDeckOrder: order, currentCardIndex: 0, currentCardId: firstId }
    });
  };

  const nextCard = (playerName: string) => {
    const effectiveIndex = optIndex ?? serverCardIndex;
    if (effectiveIndex + 1 >= shuffledDeckOrder.length) return;
    const nextIndex = effectiveIndex + 1;
    const nextId    = shuffledDeckOrder[nextIndex];

    setOptIndex(nextIndex);
    setOptCardId(nextId);
    scheduleOptClear();

    updateRoomRef.current({ code: roomCode, data: { currentCardIndex: nextIndex, currentCardId: nextId } });
    if (nextId) {
      recordCardRef.current({
        code: roomCode,
        data: { cardId: nextId, mode: activeMode, level: activeLevel, advancedByPlayerName: playerName }
      });
    }
  };

  const prevCard = () => {
    const effectiveIndex = optIndex ?? serverCardIndex;
    if (effectiveIndex <= 0) return;
    const prevIndex = effectiveIndex - 1;
    const prevId    = shuffledDeckOrder[prevIndex];

    setOptIndex(prevIndex);
    setOptCardId(prevId);
    scheduleOptClear();

    updateRoomRef.current({ code: roomCode, data: { currentCardIndex: prevIndex, currentCardId: prevId } });
  };

  const skipCard = () => {
    const effectiveIndex = optIndex ?? serverCardIndex;
    if (effectiveIndex + 1 >= shuffledDeckOrder.length) return;
    const nextIndex = effectiveIndex + 1;
    const nextId    = shuffledDeckOrder[nextIndex];

    setOptIndex(nextIndex);
    setOptCardId(nextId);
    scheduleOptClear();

    updateRoomRef.current({ code: roomCode, data: { currentCardIndex: nextIndex, currentCardId: nextId } });
  };

  const reshuffle = () => {
    const mode   = optMode   ?? serverMode;
    const level  = optLevel  ?? serverLevel;
    const filter = optFilter ?? serverFilter;
    const deck   = computeFilteredDeck(mode, level, filter);
    const order  = buildShuffledDeck(deck);
    const firstId = order[0] ?? null;

    setOptIndex(0);
    setOptCardId(firstId);
    scheduleOptClear();

    initializedRef.current = "";
    updateRoomRef.current({
      code: roomCode,
      data: { shuffledDeckOrder: order, currentCardIndex: 0, currentCardId: firstId }
    });
  };

  const setAfterDark = useCallback((unlocked: boolean) => {
    updateRoomRef.current({ code: roomCode, data: { afterDarkUnlocked: unlocked } });
  }, [roomCode]);

  const resetRoom = () => {
    const firstId = shuffledDeckOrder[0] ?? null;
    setOptIndex(0);
    setOptCardId(firstId);
    scheduleOptClear();
    updateRoomRef.current({ code: roomCode, data: { currentCardIndex: 0, currentCardId: firstId } });
  };

  return {
    room,
    isLoading,
    currentCard,
    currentCardIndex,
    totalCards: shuffledDeckOrder.length,
    activeMode,
    activeLevel,
    activeRelationshipFilter,
    afterDarkUnlocked: room?.afterDarkUnlocked ?? false,
    changeMode,
    changeLevel,
    changeRelationshipFilter,
    nextCard,
    prevCard,
    skipCard,
    reshuffle,
    setAfterDark,
    resetRoom,
  };
}
