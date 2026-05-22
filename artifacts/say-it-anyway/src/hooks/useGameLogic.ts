import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  useGetRoom, 
  useUpdateRoomState, 
  useRecordCardHistory,
  getGetRoomQueryKey
} from "@workspace/api-client-react";
import { cards, Card } from "@/data/cardData";
import { useQueryClient } from "@tanstack/react-query";

export function useGameLogic(roomCode: string) {
  const queryClient = useQueryClient();
  const { data: room, isLoading } = useGetRoom(roomCode, {
    query: {
      refetchInterval: 2000,
      enabled: !!roomCode,
      queryKey: getGetRoomQueryKey(roomCode)
    }
  });

  const updateRoomState = useUpdateRoomState();
  const recordHistory = useRecordCardHistory();

  const activeMode = room?.activeMode || "classic";
  const activeLevel = room?.activeLevel || 1;
  const activeRelationshipFilter = room?.activeRelationshipFilter || "all";
  const currentCardIndex = room?.currentCardIndex || 0;
  const shuffledDeckOrder = room?.shuffledDeckOrder || [];
  const currentCardId = room?.currentCardId || null;

  // Filter cards based on state locally
  const filteredDeck = useMemo(() => {
    return cards.filter(card => {
      if (card.is_hidden || card.is_adult) return false;
      if (card.mode !== activeMode) return false;
      
      if (activeMode === "classic") {
        return card.level === activeLevel;
      }
      
      if (activeMode === "long_game") {
        if (activeRelationshipFilter !== "all" && card.relationship_context !== activeRelationshipFilter && card.relationship_context !== "all") {
          return false;
        }
        return true;
      }
      
      if (activeMode === "after_dark") {
        return true;
      }
      
      return false;
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

  const initializedRef = useRef<string>("");

  useEffect(() => {
    if (!room || !roomCode) return;
    const stateKey = `${activeMode}-${activeLevel}-${activeRelationshipFilter}`;
    
    // If the room has no shuffled deck for this state or we just changed mode/level
    if (shuffledDeckOrder.length === 0 && initializedRef.current !== stateKey && filteredDeck.length > 0) {
      initializedRef.current = stateKey;
      const newOrder = shuffleDeck(filteredDeck);
      const newCardId = newOrder[0] || null;
      
      updateRoomState.mutate({
        code: roomCode,
        data: {
          shuffledDeckOrder: newOrder,
          currentCardIndex: 0,
          currentCardId: newCardId
        }
      });
    }
  }, [room, roomCode, activeMode, activeLevel, activeRelationshipFilter, shuffledDeckOrder.length, filteredDeck, shuffleDeck, updateRoomState]);

  const currentCard = useMemo(() => {
    if (!currentCardId) return null;
    return cards.find(c => c.id === currentCardId) || null;
  }, [currentCardId]);

  const changeMode = (mode: string) => {
    updateRoomState.mutate({
      code: roomCode,
      data: {
        activeMode: mode,
        shuffledDeckOrder: [], // clear to force reshuffle
        currentCardIndex: 0,
        currentCardId: null
      }
    });
  };

  const changeLevel = (level: number) => {
    updateRoomState.mutate({
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
    updateRoomState.mutate({
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
    
    updateRoomState.mutate({
      code: roomCode,
      data: {
        currentCardIndex: nextIndex,
        currentCardId: nextId
      }
    });

    if (nextId) {
      recordHistory.mutate({
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
    
    updateRoomState.mutate({
      code: roomCode,
      data: {
        currentCardIndex: prevIndex,
        currentCardId: prevId
      }
    });
  };

  const reshuffle = () => {
    const newOrder = shuffleDeck(filteredDeck);
    updateRoomState.mutate({
      code: roomCode,
      data: {
        shuffledDeckOrder: newOrder,
        currentCardIndex: 0,
        currentCardId: newOrder[0] || null
      }
    });
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
    afterDarkUnlocked: room?.afterDarkUnlocked || false,
    changeMode,
    changeLevel,
    changeRelationshipFilter,
    nextCard,
    prevCard,
    reshuffle,
    updateRoomState
  };
}
