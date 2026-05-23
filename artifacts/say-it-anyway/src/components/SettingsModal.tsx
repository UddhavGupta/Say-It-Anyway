import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import HowToPlayModal from "@/components/HowToPlayModal";
import ConfirmModal from "@/components/ConfirmModal";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  afterDarkUnlocked: boolean;
  onUnlockAfterDark: () => void;
  onLockAfterDark: () => void;
  onResetRoom: () => void;
  onExitRoom: () => void;
  onShowIntro: () => void;
  currentDeckSize: number;
  currentMode: string;
  currentLevel: number;
  currentFilter: string;
  // Memory / privacy
  privateMode: boolean;
  onTogglePrivateMode: (enabled: boolean) => void;
  worthRevisitingCount: number;
  recentlyPlayedCount: number;
  onOpenWorthRevisiting: () => void;
  onOpenRecentlyPlayed: () => void;
  onEndSession: () => void;
  onClearRecentlyPlayed: () => void;
  onClearWorthRevisiting: () => void;
  onClearSession: () => void;
  onClearAllData: () => void;
  // Turn Keeper
  tkEnabled: boolean;
  tkCurrentPlayerName: string | null;
  onEnableTk: () => void;
  onOpenTkSetup: () => void;
  onDisableTk: () => void;
  onTkPassTurn: () => void;
  onTkResetTurns: () => void;
  onTkShuffleOrder: () => void;
}

const MODE_LABELS: Record<string, string> = {
  classic:    "Classic",
  long_game:  "The Long Game",
  after_dark: "After Dark",
};

const FILTER_LABELS: Record<string, string> = {
  all:           "All Questions",
  couples:       "Couples",
  close_friends: "Close Friends",
  dating:        "Dating",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Read the Room",
  2: "Beneath the Surface",
  3: "Say It Anyway",
};

const CARD_STATS = [
  { label: "Total cards", count: 850 },
  { label: "Classic", count: 450, children: [
    { label: "Read the Room",       count: 150 },
    { label: "Beneath the Surface", count: 150 },
    { label: "Say It Anyway",       count: 150 },
  ]},
  { label: "The Long Game", count: 200 },
  { label: "After Dark",    count: 200 },
];

interface ConfirmState {
  title: string;
  description: string;
  label: string;
  action: () => void;
}

export default function SettingsModal({
  open, onOpenChange,
  roomCode, afterDarkUnlocked,
  onUnlockAfterDark, onLockAfterDark, onResetRoom, onExitRoom, onShowIntro,
  currentDeckSize, currentMode, currentLevel, currentFilter,
  privateMode, onTogglePrivateMode,
  worthRevisitingCount, recentlyPlayedCount,
  onOpenWorthRevisiting, onOpenRecentlyPlayed, onEndSession,
  onClearRecentlyPlayed, onClearWorthRevisiting, onClearSession, onClearAllData,
  tkEnabled, tkCurrentPlayerName,
  onEnableTk, onOpenTkSetup, onDisableTk,
  onTkPassTurn, onTkResetTurns, onTkShuffleOrder,
}: SettingsModalProps) {
  const [secretCode,    setSecretCode]    = useState("");
  const [copied,        setCopied]        = useState(false);
  const [statsOpen,     setStatsOpen]     = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [confirm,       setConfirm]       = useState<ConfirmState | null>(null);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSecretCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSecretCode(val);
    if (val === "AFTERDARK" && !afterDarkUnlocked) {
      setSecretCode("");
      onUnlockAfterDark();
      onOpenChange(false);
    }
  };

  const askConfirm = (cfg: ConfirmState) => setConfirm(cfg);

  const sessionLabel =
    currentMode === "classic"
      ? `${MODE_LABELS[currentMode]} · ${LEVEL_LABELS[currentLevel]}`
      : currentMode === "long_game"
        ? `${MODE_LABELS[currentMode]} · ${FILTER_LABELS[currentFilter] ?? currentFilter}`
        : MODE_LABELS[currentMode] ?? currentMode;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm max-h-[88dvh] flex flex-col overflow-hidden p-0">

          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
            <DialogTitle className="font-serif text-2xl font-medium">Settings</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-5 py-3 space-y-0">

            {/* Room Code */}
            <div className="space-y-2 py-3 border-b border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Room Code</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-center tracking-[0.3em] text-lg font-medium">
                  {roomCode}
                </div>
                <Button
                  onClick={copyRoomCode}
                  variant="outline"
                  className={cn("px-4 min-w-[72px] transition-all", copied && "text-green-600 border-green-300")}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Prompt Memory */}
            <div className="space-y-1 py-3 border-b border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Prompt Memory</p>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium"
                onClick={() => { onOpenRecentlyPlayed(); onOpenChange(false); }}
              >
                <span className="text-base">🕐</span>
                Recently Played
                {recentlyPlayedCount > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground font-mono">{recentlyPlayedCount}</span>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium"
                onClick={() => { onOpenWorthRevisiting(); onOpenChange(false); }}
              >
                <span className="text-base">🔖</span>
                Worth Revisiting
                {worthRevisitingCount > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground font-mono">{worthRevisitingCount}</span>
                )}
              </Button>
            </div>

            {/* Turn Keeper */}
            <div className="py-3 border-b border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Turn Keeper</p>

              {tkEnabled ? (
                <div className="space-y-1">
                  {tkCurrentPlayerName && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/60 rounded-lg mb-2">
                      <span className="text-sm">👤</span>
                      <span className="text-sm text-foreground/70">{tkCurrentPlayerName}'s turn</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-sm font-medium"
                    onClick={() => { onTkPassTurn(); onOpenChange(false); }}
                  >
                    <span className="text-base">⏭</span> Pass Turn
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-sm font-medium"
                    onClick={() => { onTkResetTurns(); onOpenChange(false); }}
                  >
                    <span className="text-base">↺</span> Reset Turns
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-sm font-medium"
                    onClick={() => { onTkShuffleOrder(); onOpenChange(false); }}
                  >
                    <span className="text-base">⤮</span> Shuffle Order
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-sm font-medium"
                    onClick={onOpenTkSetup}
                  >
                    <span className="text-base">✎</span> Edit Player Order
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-sm font-medium text-muted-foreground"
                    onClick={() => { onDisableTk(); onOpenChange(false); }}
                  >
                    <span className="text-base">✕</span> Turn off Turn Keeper
                  </Button>
                  <p className="text-[10px] text-muted-foreground/35 pl-1 pt-1 leading-relaxed">
                    Turn Keeper tracks whose turn it is, not what anyone says.
                    Stored locally on this device.
                  </p>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-sm font-medium"
                  onClick={onEnableTk}
                >
                  <span className="text-base">👥</span> Set up Turn Keeper
                </Button>
              )}
            </div>

            {/* Game Actions */}
            <div className="space-y-1 py-3 border-b border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Game</p>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium"
                onClick={() => { setHowToPlayOpen(true); onOpenChange(false); }}
              >
                <span className="text-base">🎴</span> How to Play
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium"
                onClick={onShowIntro}
              >
                <span className="text-base">✦</span> Show intro again
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium"
                onClick={() => { onResetRoom(); onOpenChange(false); }}
              >
                <span className="text-base">↺</span> Reset Deck to Start
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium"
                onClick={() => { onOpenChange(false); onEndSession(); }}
              >
                <span className="text-base">■</span> End Session
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium text-muted-foreground"
                onClick={() => { onOpenChange(false); onExitRoom(); }}
              >
                <span className="text-base">←</span> Exit Room
              </Button>
            </div>

            {/* Privacy */}
            <div className="py-3 border-b border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">Privacy</p>

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">Private Mode</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">
                    Prevents this device from saving recently played or Worth Revisiting cards.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={privateMode}
                  onClick={() => onTogglePrivateMode(!privateMode)}
                  className={cn(
                    "shrink-0 mt-0.5 w-10 h-6 rounded-full transition-colors duration-200 relative",
                    privateMode ? "bg-primary" : "bg-muted-foreground/25",
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                    privateMode ? "translate-x-5" : "translate-x-1",
                  )} />
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground/50 leading-relaxed mb-3">
                Your answers are not recorded. Saved prompts live only on this device.
              </p>

              <div className="space-y-0.5">
                {[
                  {
                    label: "Clear Recently Played",
                    disabled: recentlyPlayedCount === 0,
                    confirm: {
                      title: "Clear Recently Played",
                      description: "This removes prompt history from this session. It won't affect the card library.",
                      label: "Clear",
                      action: onClearRecentlyPlayed,
                    },
                  },
                  {
                    label: "Clear Worth Revisiting",
                    disabled: worthRevisitingCount === 0,
                    confirm: {
                      title: "Clear Worth Revisiting",
                      description: "This removes saved prompts from this device. It won't affect the card library.",
                      label: "Clear",
                      action: onClearWorthRevisiting,
                    },
                  },
                  {
                    label: "Clear Session Data",
                    disabled: false,
                    confirm: {
                      title: "Clear Session Data",
                      description: "This clears recently played, saved prompts, and current session activity from this device.",
                      label: "Clear",
                      action: onClearSession,
                    },
                  },
                  {
                    label: "Clear All Local App Data",
                    disabled: false,
                    confirm: {
                      title: "Clear All Local Data",
                      description: "This clears all saved prompts, history, preferences, and the After Dark unlock on this device. It won't affect the card library.",
                      label: "Clear Everything",
                      action: onClearAllData,
                    },
                  },
                ].map(item => (
                  <button
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => askConfirm(item.confirm)}
                    className="w-full text-left text-xs py-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* After Dark */}
            <div className="py-3 border-b border-border">
              {afterDarkUnlocked ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-sm font-medium text-muted-foreground"
                  onClick={() => { onLockAfterDark(); onOpenChange(false); }}
                >
                  <span className="text-base">🔒</span> Lock After Dark
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Unlock After Dark</p>
                  <Input
                    placeholder="Enter secret code..."
                    value={secretCode}
                    onChange={handleSecretCode}
                    className="bg-background text-center tracking-widest uppercase"
                  />
                </div>
              )}
            </div>

            {/* Card Stats */}
            <div className="py-3 border-b border-border">
              <button
                onClick={() => setStatsOpen(v => !v)}
                className="w-full flex items-center justify-between text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <span className="uppercase tracking-widest font-medium">Card Stats</span>
                <span className={cn("transition-transform duration-150", statsOpen ? "rotate-180" : "")}>▾</span>
              </button>

              {statsOpen && (
                <div className="mt-3 space-y-3 text-xs text-muted-foreground">
                  <div>
                    <div className="font-medium text-foreground/60 mb-1 uppercase tracking-widest text-[10px]">Session</div>
                    <div className="ml-3 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Current deck</span>
                        <span className="font-mono">{currentDeckSize} cards</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mode</span>
                        <span className="font-mono">{sessionLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Card data</span>
                        <span className="font-mono">static / local</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-foreground/60 mb-1 uppercase tracking-widest text-[10px]">All Cards</div>
                    <div className="space-y-1">
                      {CARD_STATS.map(stat => (
                        <div key={stat.label}>
                          <div className="flex justify-between font-medium text-foreground/70">
                            <span>{stat.label}</span>
                            <span className="font-mono">{stat.count}</span>
                          </div>
                          {"children" in stat && stat.children && (
                            <div className="ml-3 mt-0.5 space-y-0.5">
                              {stat.children.map(child => (
                                <div key={child.label} className="flex justify-between">
                                  <span>{child.label}</span>
                                  <span className="font-mono">{child.count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <div className="py-3">
              <p className="text-xs text-muted-foreground/50 leading-relaxed">
                Made for better conversations.<br />
                Personal project under testing. Not for commercial use or public distribution without prior permission.
              </p>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      <HowToPlayModal open={howToPlayOpen} onOpenChange={setHowToPlayOpen} />

      {confirm && (
        <ConfirmModal
          open={!!confirm}
          onOpenChange={v => { if (!v) setConfirm(null); }}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.label}
          onConfirm={confirm.action}
          destructive
        />
      )}
    </>
  );
}
