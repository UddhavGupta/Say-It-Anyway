import { useEffect, useRef, useCallback, useMemo } from "react";
import { 
  useGetRoom, 
  useUpdateRoomState, 
  useRecordCardHistory,
  getGetRoomQueryKey
} from "@workspace/api-client-react";
import { cards, Card } from "@/data/cardData";

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

  const activeMode = room?.activeMode || "classic";
  const activeLevel = room?.activeLevel || 1;
  const activeRelationshipFilter = room?.activeRelationshipFilter || "all";
  const currentCardIndex = room?.currentCardIndex || 0;
  const shuffledDeckOrder = room?.shuffledDeckOrder || [];
  const currentCardId = room?.currentCardId || null;

  // Filter cards based on current mode/level/filter
  const filteredDeck = useMemo(() => {
    return cards.filter(card => {
      if (card.mode !== activeMode) return false;

      // For classic and long_game, exclude hidden and adult cards
      if (activeMode !== "after_dark" && (card.is_hidden || card.is_adult)) return false;

      if (activeMode === "classic") {
        return card.level === activeLevel;
      }

      if (activeMode === "long_game") {
        if (
          activeRelationshipFilter !== "all" &&
          card.relationship_context !== activeRelationshipFilter &&
          card.relationship_context !== "all"
        ) {
          return false;
        }
        return true;
      }

      // after_dark — include all cards in the mode
      return true;
    });
  }, [activeMode, activeLevel, activeRelationshipFilter]);

  const shuffleDeck = useCallback((deckToShuffle: Card[]) => {
    const ids = deckToShuffle.map(c => c.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }, []);

  // Use a ref so the effect below never re-runs just because the mutation
  // object changed reference (React Query mutates isPending/isSuccess on each call).
  const updateRoomRef = useRef(updateRoom);
  useEffect(() => { updateRoomRef.current = updateRoom; });

  const filteredDeckRef = useRef(filteredDeck);
  useEffect(() => { filteredDeckRef.current = filteredDeck; });

  const initializedRef = useRef<string>("");

  useEffect(() => {
    if (!room || !roomCode) return;
    const stateKey = `${activeMode}-${activeLevel}-${activeRelationshipFilter}`;

    // Only shuffle once per distinct (mode, level, filter) combination, and only
    // when the server still has an empty deck (e.g. right after a mode change).
    if (
      shuffledDeckOrder.length === 0 &&
      initializedRef.current !== stateKey &&
      filteredDeckRef.current.length > 0
    ) {
      initializedRef.current = stateKey;
      const newOrder = shuffleDeck(filteredDeckRef.current);
      const newCardId = newOrder[0] || null;

      updateRoomRef.current({
        code: roomCode,
        data: {
          shuffledDeckOrder: newOrder,
          currentCardIndex: 0,
          currentCardId: newCardId
        }
      });
    }
  // shuffleDeck is stable (useCallback []). Only re-run when server state changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, roomCode, activeMode, activeLevel, activeRelationshipFilter, shuffledDeckOrder.length, shuffleDeck]);

  const currentCard = useMemo(() => {
    if (!currentCardId) return null;
    return cards.find(c => c.id === currentCardId) || null;
  }, [currentCardId]);

  const changeMode = (mode: string) => {
    initializedRef.current = "";
    updateRoomRef.current({
      code: roomCode,
      data: {
        activeMode: mode,
        shuffledDeckOrder: [],
        currentCardIndex: 0,
        currentCardId: null
      }
    });
  };

  const changeLevel = (level: number) => {
    initializedRef.current = "";
    updateRoomRef.current({
      code: roomCode,
      data: {
        activeLevel: level,
        shuffledDeckOrder: [],
        currentCardIndex: 0,
        currentCardId: null
      }
    });
  };

  const changeRelationshipFilter = (filter: string) => {
    initializedRef.current = "";
    updateRoomRef.current({
      code: roomCode,
      data: {
        activeRelationshipFilter: filter,
        shuffledDeckOrder: [],
        currentCardIndex: 0,
        currentCardId: null
      }
    });
  };

  const nextCard = (playerName: string) => {
    if (currentCardIndex + 1 >= shuffledDeckOrder.length) return;
    const nextIndex = currentCardIndex + 1;
    const nextId = shuffledDeckOrder[nextIndex];

    updateRoomRef.current({
      code: roomCode,
      data: {
        currentCardIndex: nextIndex,
        currentCardId: nextId
      }
    });

    if (nextId) {
      recordCard({
        code: roomCode,
        data: {
          cardId: nextId,
          mode: activeMode,
          level: activeLevel,
          advancedByPlayerName: playerName
        }
      });
    }
  };

  const prevCard = () => {
    if (currentCardIndex <= 0) return;
    const prevIndex = currentCardIndex - 1;
    const prevId = shuffledDeckOrder[prevIndex];

    updateRoomRef.current({
      code: roomCode,
      data: {
        currentCardIndex: prevIndex,
        currentCardId: prevId
      }
    });
  };

  const skipCard = () => {
    if (currentCardIndex + 1 >= shuffledDeckOrder.length) return;
    const nextIndex = currentCardIndex + 1;
    const nextId = shuffledDeckOrder[nextIndex];
    updateRoomRef.current({
      code: roomCode,
      data: { currentCardIndex: nextIndex, currentCardId: nextId }
    });
  };

  const reshuffle = () => {
    initializedRef.current = "";
    const newOrder = shuffleDeck(filteredDeckRef.current);
    updateRoomRef.current({
      code: roomCode,
      data: {
        shuffledDeckOrder: newOrder,
        currentCardIndex: 0,
        currentCardId: newOrder[0] || null
      }
    });
  };

  const setAfterDark = useCallback((unlocked: boolean) => {
    updateRoomRef.current({ code: roomCode, data: { afterDarkUnlocked: unlocked } });
  }, [roomCode]);

  const resetRoom = useCallback(() => {
    const firstId = shuffledDeckOrder[0] ?? null;
    updateRoomRef.current({
      code: roomCode,
      data: { currentCardIndex: 0, currentCardId: firstId }
    });
  // shuffledDeckOrder identity changes with every poll; use the length as a
  // stable proxy — the first element won't change unless the deck is reshuffled.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, shuffledDeckOrder[0]]);

  return {
    room,
    isLoading,
    currentCard,
    currentCardIndex,
    totalCards: shuffledDeckOrder.length,
    activeMode,
    activeLevel,
    activeRelationshipFilter,
    afterDarkUnlocked: room?.afterDarkUnlocked || false,
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
