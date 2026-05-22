import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useGameLogic } from "@/hooks/useGameLogic";
import { usePlayerSync } from "@/hooks/usePlayerSync";
import { PLAYER_ID_KEY, PLAYER_NAME_KEY } from "@/lib/constants";
import PromptCard from "@/components/PromptCard";
import ModeSelector from "@/components/ModeSelector";
import LevelSelector from "@/components/LevelSelector";
import PlayerList from "@/components/PlayerList";
import SettingsModal from "@/components/SettingsModal";
import AfterDarkUnlockModal from "@/components/AfterDarkUnlockModal";
import HowToPlayModal from "@/components/HowToPlayModal";
import { cn } from "@/lib/utils";

const FILTER_LABELS: Record<string, string> = {
  all: "All Questions",
  couples: "Couples",
  close_friends: "Close Friends",
  dating: "Dating",
};

export default function Room() {
  const { code } = useParams<{ code: string }>();
  const [, setLocation] = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem(PLAYER_ID_KEY);
    const name = localStorage.getItem(PLAYER_NAME_KEY);
    if (!id || !name) { setLocation("/"); return; }
    setPlayerId(id);
    setPlayerName(name);
  }, [setLocation]);

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

  // Keep game actions in a ref so keyboard handler stays stable
  const actionsRef = useRef({ nextCard, prevCard, skipCard, reshuffle, playerName });
  useEffect(() => { actionsRef.current = { nextCard, prevCard, skipCard, reshuffle, playerName }; });

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") actionsRef.current.nextCard(actionsRef.current.playerName);
      if (e.key === "ArrowLeft") actionsRef.current.prevCard();
      if (e.key === "s" || e.key === "S") actionsRef.current.reshuffle();
      if (e.key === "Escape") {
        setSettingsOpen(false);
        setUnlockModalOpen(false);
        setHowToPlayOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Body theme class
  useEffect(() => {
    const base = "font-sans antialiased bg-background text-foreground";
    if (activeMode === "after_dark") document.body.className = `theme-after-dark ${base}`;
    else if (activeMode === "long_game") document.body.className = `theme-long-game ${base}`;
    else document.body.className = base;
    return () => { document.body.className = base; };
  }, [activeMode]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(code || "");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (isLoading || !room) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const isEnd = totalCards > 0 && currentCardIndex >= totalCards;

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 md:px-8 pb-12 relative overflow-hidden transition-colors duration-700">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between py-4 mb-2 z-10">
        <div className="font-serif font-medium text-xl tracking-tight shrink-0">Say It Anyway</div>

        {/* Room code — centered on wider screens, right on mobile */}
        <button
          onClick={copyRoomCode}
          className={cn(
            "group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest uppercase transition-all duration-200",
            "border border-border/50 hover:border-border",
            codeCopied ? "text-green-600 border-green-300" : "text-muted-foreground hover:text-foreground"
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
          {/* How to Play */}
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
          {/* Settings */}
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
            onModeChange={changeMode}
          />

          {activeMode === "classic" && (
            <LevelSelector activeLevel={activeLevel} onLevelChange={changeLevel} />
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
                    onClick={() => changeRelationshipFilter(filter)}
                    className={cn(
                      "whitespace-nowrap px-3.5 py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-300",
                      activeRelationshipFilter === filter
                        ? "border-primary bg-primary/8 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
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
            card={currentCard}
            totalCards={totalCards}
            currentIndex={currentCardIndex}
            onNext={() => nextCard(playerName)}
            onPrev={prevCard}
            onSkip={skipCard}
            onReshuffle={reshuffle}
            onReset={resetRoom}
            isEnd={isEnd}
            mode={activeMode}
          />
        </div>

        {/* Players */}
        <div className="mt-8">
          <PlayerList players={players || []} localPlayerId={playerId} />
        </div>
      </main>

      {/* ── Modals ── */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        roomCode={code || ""}
        afterDarkUnlocked={afterDarkUnlocked}
        onUnlockAfterDark={() => setUnlockModalOpen(true)}
        onLockAfterDark={() => { setAfterDark(false); if (activeMode === "after_dark") changeMode("classic"); }}
        onResetRoom={resetRoom}
      />

      <AfterDarkUnlockModal
        open={unlockModalOpen}
        onOpenChange={setUnlockModalOpen}
        onUnlock={() => setAfterDark(true)}
      />

      <HowToPlayModal open={howToPlayOpen} onOpenChange={setHowToPlayOpen} />
    </div>
  );
}
