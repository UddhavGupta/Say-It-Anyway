import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useGameLogic } from "@/hooks/useGameLogic";
import { usePlayerSync } from "@/hooks/usePlayerSync";
import { useSessionMemory, PlayedCard, SavedCard } from "@/hooks/useSessionMemory";
import { PLAYER_ID_KEY, PLAYER_NAME_KEY } from "@/lib/constants";
import { cardById } from "@/data/cardData";
import type { Card as CardType } from "@/data/cardData";
import PromptCard from "@/components/PromptCard";
import ModeSelector from "@/components/ModeSelector";
import LevelSelector from "@/components/LevelSelector";
import PlayerList from "@/components/PlayerList";
import SettingsModal from "@/components/SettingsModal";
import AfterDarkUnlockModal from "@/components/AfterDarkUnlockModal";
import HowToPlayModal from "@/components/HowToPlayModal";
import GameIntroModal, { INTRO_SEEN_KEY } from "@/components/GameIntroModal";
import RecentlyPlayedDrawer from "@/components/RecentlyPlayedDrawer";
import WorthRevisitingDrawer from "@/components/WorthRevisitingDrawer";
import EndSessionModal, { SessionStats } from "@/components/EndSessionModal";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const FILTER_LABELS: Record<string, string> = {
  all:           "All Questions",
  couples:       "Couples",
  close_friends: "Close Friends",
  dating:        "Dating",
};

export default function Room() {
  const { code } = useParams<{ code: string }>();
  const [, setLocation] = useLocation();

  // ── Modal visibility ─────────────────────────────────────────────────────
  const [settingsOpen,       setSettingsOpen]       = useState(false);
  const [unlockModalOpen,    setUnlockModalOpen]    = useState(false);
  const [howToPlayOpen,      setHowToPlayOpen]      = useState(false);
  const [introOpen,          setIntroOpen]          = useState(false);
  const [recentlyPlayedOpen, setRecentlyPlayedOpen] = useState(false);
  const [worthRevisOpen,     setWorthRevisOpen]     = useState(false);
  const [endSessionOpen,     setEndSessionOpen]     = useState(false);
  const [codeCopied,         setCodeCopied]         = useState(false);
  const introCheckedRef = useRef(false);

  // ── Player identity ──────────────────────────────────────────────────────
  const [playerId,   setPlayerId]   = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const id   = localStorage.getItem(PLAYER_ID_KEY);
    const name = localStorage.getItem(PLAYER_NAME_KEY);
    if (!id || !name) { setLocation("/"); return; }
    setPlayerId(id);
    setPlayerName(name);
  }, [setLocation]);

  // ── Game logic ───────────────────────────────────────────────────────────
  const {
    room, isLoading,
    currentCard, currentCardIndex, totalCards,
    activeMode, activeLevel, activeRelationshipFilter,
    afterDarkUnlocked,
    changeMode, changeLevel, changeRelationshipFilter,
    nextCard, prevCard, skipCard, reshuffle,
    setAfterDark, resetRoom,
  } = useGameLogic(code || "");

  const { players } = usePlayerSync(code || "", playerId);

  // ── Session memory ───────────────────────────────────────────────────────
  const {
    privateMode, recentlyPlayed, worthRevisiting, notForThisRoom, sessionModesUsed,
    trackCard, trackMode, saveForLater, removeFromWorthRevisiting, markNotForThisRoom,
    togglePrivateMode, clearRecentlyPlayed, clearWorthRevisiting, clearSession, clearAllData,
  } = useSessionMemory();

  // ── Replay state ─────────────────────────────────────────────────────────
  const [replayCard, setReplayCard] = useState<CardType | null>(null);
  const replayCardRef = useRef<CardType | null>(null);

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Stable refs for latest values ────────────────────────────────────────
  // Keeps useCallback wrappers with [] deps working correctly.

  const cardActionsRef = useRef({
    nextCard, prevCard, skipCard, reshuffle, resetRoom, playerName,
  });
  useEffect(() => {
    cardActionsRef.current = { nextCard, prevCard, skipCard, reshuffle, resetRoom, playerName };
  });

  const selectorActionsRef = useRef({ changeMode, changeLevel, changeRelationshipFilter });
  useEffect(() => {
    selectorActionsRef.current = { changeMode, changeLevel, changeRelationshipFilter };
  });

  // activeMode ref so card-tracking effect always reads the current mode
  const activeModeRef = useRef(activeMode);
  useEffect(() => { activeModeRef.current = activeMode; }, [activeMode]);

  const memoryRef = useRef({ saveForLater, markNotForThisRoom, trackCard, trackMode, currentCard });
  useEffect(() => {
    memoryRef.current = { saveForLater, markNotForThisRoom, trackCard, trackMode, currentCard };
  });

  // ── Selector callbacks ───────────────────────────────────────────────────
  const handleModeChange   = useCallback((m: string) => selectorActionsRef.current.changeMode(m), []);
  const handleLevelChange  = useCallback((l: number) => selectorActionsRef.current.changeLevel(l), []);
  const handleFilterChange = useCallback((f: string) => selectorActionsRef.current.changeRelationshipFilter(f), []);

  // ── Card navigation (also clears replay) ────────────────────────────────
  const clearReplay = () => { setReplayCard(null); replayCardRef.current = null; };

  const handleNext = useCallback(() => {
    clearReplay();
    cardActionsRef.current.nextCard(cardActionsRef.current.playerName);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrev = useCallback(() => {
    clearReplay();
    cardActionsRef.current.prevCard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkip = useCallback(() => {
    clearReplay();
    cardActionsRef.current.skipCard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReshuffle = useCallback(() => {
    clearReplay();
    cardActionsRef.current.reshuffle();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = useCallback(() => {
    clearReplay();
    cardActionsRef.current.resetRoom();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Memory action callbacks ──────────────────────────────────────────────

  const handleAskAgainLater = useCallback(() => {
    const card = replayCardRef.current ?? memoryRef.current.currentCard;
    if (!card) return;
    const status = memoryRef.current.saveForLater({
      cardId: card.id,
      prompt: card.prompt,
      mode: activeModeRef.current,
      levelName: card.level_name ?? "",
      relationshipContext: card.relationship_context ?? "",
      savedAt: Date.now(),
    });
    if (status === "private_mode") showToast("Private Mode is on. Saved prompts are disabled.");
    else if (status === "already_saved") showToast("Already in Worth Revisiting.");
    else showToast("Saved to Worth Revisiting.");
  }, [showToast]);

  const handleNotForThisRoom = useCallback(() => {
    const card = memoryRef.current.currentCard;
    if (!card) return;
    memoryRef.current.markNotForThisRoom(card.id);
    setReplayCard(null);
    replayCardRef.current = null;
    cardActionsRef.current.skipCard();
    showToast("Removed from this session.");
  }, [showToast]);

  // Replay from Recently Played drawer
  const handleReplayFromRecent = useCallback((played: PlayedCard) => {
    const card = cardById.get(played.cardId);
    if (!card) { showToast("Card not available in current deck."); return; }
    memoryRef.current.trackCard({ ...played, playedAt: Date.now() });
    setReplayCard(card);
    replayCardRef.current = card;
    setRecentlyPlayedOpen(false);
  }, [showToast]);

  // Replay from Worth Revisiting drawer
  const handleReplayFromWorth = useCallback((saved: SavedCard) => {
    const card = cardById.get(saved.cardId);
    if (!card) { showToast("Card not available."); return; }
    setReplayCard(card);
    replayCardRef.current = card;
    setWorthRevisOpen(false);
  }, [showToast]);

  // Ask Again Later from Recently Played drawer
  const handleAskAgainLaterFromHistory = useCallback((played: PlayedCard) => {
    const status = memoryRef.current.saveForLater({
      cardId: played.cardId,
      prompt: played.prompt,
      mode: played.mode,
      levelName: played.levelName,
      relationshipContext: played.relationshipContext,
      savedAt: Date.now(),
    });
    if (status === "private_mode") showToast("Private Mode is on. Saved prompts are disabled.");
    else if (status === "already_saved") showToast("Already in Worth Revisiting.");
    else showToast("Saved to Worth Revisiting.");
  }, [showToast]);

  // Not for this room from Recently Played drawer (just marks, no skip)
  const handleNotForThisRoomFromHistory = useCallback((played: PlayedCard) => {
    memoryRef.current.markNotForThisRoom(played.cardId);
    showToast("Removed from this session.");
  }, [showToast]);

  // ── Clear actions ────────────────────────────────────────────────────────
  const handleClearSession = useCallback(() => {
    clearSession();
    setReplayCard(null);
    replayCardRef.current = null;
  }, [clearSession]);

  const handleClearAllData = useCallback(() => {
    clearAllData();
    setReplayCard(null);
    replayCardRef.current = null;
    localStorage.removeItem(INTRO_SEEN_KEY);
    showToast("All local data cleared.");
  }, [clearAllData, showToast]);

  const handleNewSession = useCallback(() => {
    clearSession();
    setReplayCard(null);
    replayCardRef.current = null;
    cardActionsRef.current.reshuffle();
  }, [clearSession]);

  // ── Track card changes ───────────────────────────────────────────────────
  const prevTrackedCardIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentCard) return;
    if (currentCard.id === prevTrackedCardIdRef.current) return;
    prevTrackedCardIdRef.current = currentCard.id;
    const mode = activeModeRef.current;
    memoryRef.current.trackCard({
      cardId: currentCard.id,
      prompt: currentCard.prompt,
      mode,
      levelName: currentCard.level_name ?? "",
      relationshipContext: currentCard.relationship_context ?? "",
      playedAt: Date.now(),
    });
    memoryRef.current.trackMode(mode);
  }, [currentCard?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Game intro ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && room && !introCheckedRef.current) {
      introCheckedRef.current = true;
      if (!localStorage.getItem(INTRO_SEEN_KEY)) setIntroOpen(true);
    }
  }, [isLoading, room]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft")  handlePrev();
      if (e.key === "s" || e.key === "S") handleReshuffle();
      if (e.key === "Escape") {
        setSettingsOpen(false);
        setUnlockModalOpen(false);
        setHowToPlayOpen(false);
        setRecentlyPlayedOpen(false);
        setWorthRevisOpen(false);
        setEndSessionOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrev, handleReshuffle]);

  // ── Theme class on body ──────────────────────────────────────────────────
  useEffect(() => {
    const base = "font-sans antialiased bg-background text-foreground";
    if      (activeMode === "after_dark") document.body.className = `theme-after-dark ${base}`;
    else if (activeMode === "long_game")  document.body.className = `theme-long-game ${base}`;
    else                                  document.body.className = base;
    return () => { document.body.className = base; };
  }, [activeMode]);

  // ── Derived values for render ────────────────────────────────────────────
  const effectiveCard      = replayCard ?? currentCard;
  const isReplaying        = !!replayCard;
  const isInWorthRevisiting = effectiveCard
    ? worthRevisiting.some(c => c.cardId === effectiveCard.id)
    : false;
  const savedCardIds = useMemo(
    () => new Set(worthRevisiting.map(c => c.cardId)),
    [worthRevisiting],
  );

  const sessionStats = useMemo<SessionStats>(() => ({
    cardsPlayed:          recentlyPlayed.length,
    modesUsed:            Array.from(sessionModesUsed),
    worthRevisitingCount: worthRevisiting.length,
    notForThisRoomCount:  notForThisRoom.size,
  }), [recentlyPlayed.length, sessionModesUsed, worthRevisiting.length, notForThisRoom.size]);

  const worthRevisitingThisSession = useMemo(() => {
    const played = new Set(recentlyPlayed.map(c => c.cardId));
    return worthRevisiting.filter(c => played.has(c.cardId));
  }, [recentlyPlayed, worthRevisiting]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(code || "");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading || !room) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const isEnd = totalCards > 0 && currentCardIndex >= totalCards;

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 md:px-8 pb-12 relative overflow-hidden">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between py-4 mb-2 z-10">
        <div className="font-serif font-medium text-xl tracking-tight shrink-0">Say It Anyway</div>

        <button
          onClick={copyRoomCode}
          className={cn(
            "group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest uppercase transition-colors duration-150",
            "border border-border/50 hover:border-border",
            codeCopied ? "text-green-600 border-green-300" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label="Copy room code"
        >
          {codeCopied ? "Copied!" : code}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setHowToPlayOpen(true)}
            className="p-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors rounded-lg"
            aria-label="How to play"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
            aria-label="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full z-10">

        {/* Mode + Level selectors */}
        <div className="mb-6 space-y-4">
          <ModeSelector
            activeMode={activeMode}
            afterDarkUnlocked={afterDarkUnlocked}
            onModeChange={handleModeChange}
          />

          {activeMode === "classic" && (
            <LevelSelector activeLevel={activeLevel} onLevelChange={handleLevelChange} />
          )}

          {activeMode === "long_game" && (
            <div className="space-y-3">
              <p className="text-center text-xs text-muted-foreground/70 italic">
                For people who already know the biography and want the operating manual.
              </p>
              <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none pb-1 px-2">
                {["all", "couples", "close_friends", "dating"].map(filter => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={cn(
                      "whitespace-nowrap px-3.5 py-1.5 text-xs sm:text-sm rounded-full border transition-colors duration-150",
                      activeRelationshipFilter === filter
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {FILTER_LABELS[filter] ?? filter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card area */}
        <div className="flex-1 flex flex-col justify-center">
          <PromptCard
            card={effectiveCard}
            totalCards={totalCards}
            currentIndex={currentCardIndex}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            onReshuffle={handleReshuffle}
            onReset={handleReset}
            isEnd={isEnd}
            mode={activeMode}
            onAskAgainLater={handleAskAgainLater}
            onNotForThisRoom={handleNotForThisRoom}
            onOpenRecentlyPlayed={() => setRecentlyPlayedOpen(true)}
            recentlyPlayedCount={recentlyPlayed.length}
            isInWorthRevisiting={isInWorthRevisiting}
            isReplaying={isReplaying}
          />
        </div>

        {/* Players */}
        <div className="mt-8">
          <PlayerList players={players || []} localPlayerId={playerId} />
        </div>

        <Footer />
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-foreground/90 text-background text-xs font-medium shadow-lg">
            {toast}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        roomCode={code || ""}
        afterDarkUnlocked={afterDarkUnlocked}
        onUnlockAfterDark={() => setUnlockModalOpen(true)}
        onLockAfterDark={() => { setAfterDark(false); if (activeMode === "after_dark") handleModeChange("classic"); }}
        onResetRoom={handleReset}
        onExitRoom={() => setLocation("/")}
        onShowIntro={() => { setSettingsOpen(false); setIntroOpen(true); }}
        currentDeckSize={totalCards}
        currentMode={activeMode}
        currentLevel={activeLevel}
        currentFilter={activeRelationshipFilter}
        privateMode={privateMode}
        onTogglePrivateMode={togglePrivateMode}
        worthRevisitingCount={worthRevisiting.length}
        recentlyPlayedCount={recentlyPlayed.length}
        onOpenWorthRevisiting={() => { setSettingsOpen(false); setWorthRevisOpen(true); }}
        onOpenRecentlyPlayed={() => { setSettingsOpen(false); setRecentlyPlayedOpen(true); }}
        onEndSession={() => setEndSessionOpen(true)}
        onClearRecentlyPlayed={clearRecentlyPlayed}
        onClearWorthRevisiting={clearWorthRevisiting}
        onClearSession={handleClearSession}
        onClearAllData={handleClearAllData}
      />

      <AfterDarkUnlockModal
        open={unlockModalOpen}
        onOpenChange={setUnlockModalOpen}
        onUnlock={() => setAfterDark(true)}
      />

      <HowToPlayModal open={howToPlayOpen} onOpenChange={setHowToPlayOpen} />

      <GameIntroModal
        open={introOpen}
        onStart={() => { localStorage.setItem(INTRO_SEEN_KEY, "true"); setIntroOpen(false); }}
        onDismiss={() => { localStorage.setItem(INTRO_SEEN_KEY, "true"); setIntroOpen(false); }}
      />

      <RecentlyPlayedDrawer
        open={recentlyPlayedOpen}
        onOpenChange={setRecentlyPlayedOpen}
        items={recentlyPlayed}
        savedCardIds={savedCardIds}
        onReplay={handleReplayFromRecent}
        onAskAgainLater={handleAskAgainLaterFromHistory}
        onNotForThisRoom={handleNotForThisRoomFromHistory}
      />

      <WorthRevisitingDrawer
        open={worthRevisOpen}
        onOpenChange={setWorthRevisOpen}
        items={worthRevisiting}
        privateMode={privateMode}
        onReplay={handleReplayFromWorth}
        onRemove={removeFromWorthRevisiting}
      />

      <EndSessionModal
        open={endSessionOpen}
        onOpenChange={setEndSessionOpen}
        stats={sessionStats}
        worthRevisitingThisSession={worthRevisitingThisSession}
        onNewSession={handleNewSession}
        onReturn={() => setEndSessionOpen(false)}
        onClearSession={handleClearSession}
      />
    </div>
  );
}
