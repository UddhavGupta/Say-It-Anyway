import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";

export default function Room() {
  const { code } = useParams<{ code: string }>();
  const [, setLocation] = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem(PLAYER_ID_KEY);
    const name = localStorage.getItem(PLAYER_NAME_KEY);
    if (!id || !name) {
      setLocation("/");
      return;
    }
    setPlayerId(id);
    setPlayerName(name);
  }, [setLocation]);

  const {
    room,
    isLoading,
    currentCard,
    currentCardIndex,
    totalCards,
    activeMode,
    activeLevel,
    activeRelationshipFilter,
    afterDarkUnlocked,
    changeMode,
    changeLevel,
    changeRelationshipFilter,
    nextCard,
    prevCard,
    reshuffle,
    updateRoomState
  } = useGameLogic(code || "");

  const { players } = usePlayerSync(code || "", playerId);

  // Set theme class on body based on mode
  useEffect(() => {
    if (activeMode === "after_dark") {
      document.body.className = "theme-after-dark font-sans antialiased bg-background text-foreground transition-colors duration-700";
    } else if (activeMode === "long_game") {
      document.body.className = "theme-long-game font-sans antialiased bg-background text-foreground transition-colors duration-700";
    } else {
      document.body.className = "font-sans antialiased bg-background text-foreground transition-colors duration-700";
    }
    return () => {
      document.body.className = "font-sans antialiased bg-background text-foreground transition-colors duration-700";
    };
  }, [activeMode]);

  if (isLoading || !room) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const isEnd = totalCards > 0 && currentCardIndex >= totalCards;

  const handleUnlockAfterDark = () => {
    updateRoomState.mutate({
      code: code!,
      data: { afterDarkUnlocked: true }
    });
  };

  const handleLockAfterDark = () => {
    updateRoomState.mutate({
      code: code!,
      data: { afterDarkUnlocked: false }
    });
    if (activeMode === "after_dark") {
      changeMode("classic");
    }
  };

  const handleResetRoom = () => {
    updateRoomState.mutate({
      code: code!,
      data: { currentCardIndex: 0 }
    });
  };

  const handlePromptUnlock = () => {
    setUnlockModalOpen(true);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col pt-6 pb-12 px-4 md:px-8 relative overflow-hidden transition-colors duration-700">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 z-10">
        <div className="font-serif font-medium text-xl tracking-tight">Say It Anyway</div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Room: {code}
          </div>
          <button 
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full z-10">
        
        {/* Navigation / Selectors */}
        <div className="mb-8 space-y-6">
          <ModeSelector 
            activeMode={activeMode} 
            afterDarkUnlocked={afterDarkUnlocked}
            onModeChange={changeMode}
          />
          
          {activeMode === "classic" && (
            <LevelSelector 
              activeLevel={activeLevel} 
              onLevelChange={changeLevel}
            />
          )}

          {activeMode === "long_game" && (
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto pb-2 px-2 scrollbar-none">
              {['all', 'couples', 'close_friends', 'dating'].map(filter => (
                <button
                  key={filter}
                  onClick={() => changeRelationshipFilter(filter)}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-300",
                    activeRelationshipFilter === filter
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {filter === 'all' ? 'All Questions' : filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card Area */}
        <div className="flex-1 flex flex-col justify-center min-h-[400px]">
          <PromptCard 
            card={currentCard}
            totalCards={totalCards}
            currentIndex={currentCardIndex}
            onNext={() => nextCard(playerName)}
            onPrev={prevCard}
            isEnd={isEnd}
            onReshuffle={reshuffle}
            mode={activeMode}
          />
        </div>

        {/* Players Footer */}
        <div className="mt-8">
          <PlayerList players={players || []} localPlayerId={playerId} />
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        roomCode={code || ""}
        afterDarkUnlocked={afterDarkUnlocked}
        onUnlockAfterDark={handlePromptUnlock}
        onLockAfterDark={handleLockAfterDark}
        onResetRoom={handleResetRoom}
      />

      <AfterDarkUnlockModal
        open={unlockModalOpen}
        onOpenChange={setUnlockModalOpen}
        onUnlock={handleUnlockAfterDark}
      />
    </div>
  );
}
