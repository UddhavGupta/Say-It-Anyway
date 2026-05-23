import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, X, Shuffle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TurnPlayer, TurnOrderMode } from "@/hooks/useTurnKeeper";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  return `p-${Math.random().toString(36).slice(2, 9)}`;
}

function buildPlayers(names: string[]): TurnPlayer[] {
  return names.filter(n => n.trim()).map(name => ({ id: uid(), name: name.trim() }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "method" | "manual" | "auto" | "auto-result";

interface TurnKeeperSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetup: (players: TurnPlayer[], order: string[], mode: TurnOrderMode) => void;
  onSkip?: () => void;
  initialPlayerNames?: string[];
  isEdit?: boolean;
  initialMode?: TurnOrderMode;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TurnKeeperSetupModal({
  open, onOpenChange,
  onSetup, onSkip,
  initialPlayerNames = [],
  isEdit = false,
  initialMode = "manual",
}: TurnKeeperSetupModalProps) {
  const [step,          setStep]          = useState<Step>("method");
  const [names,         setNames]         = useState<string[]>([""]);
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);

  // Reset state whenever the modal opens
  useEffect(() => {
    if (open) {
      setStep(isEdit ? initialMode : "method");
      setNames(initialPlayerNames.length > 0 ? initialPlayerNames : [""]);
      setShuffledNames([]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Name-list helpers ─────────────────────────────────────────────────────

  const addName    = () => setNames(prev => [...prev, ""]);
  const removeName = (i: number) => setNames(prev => prev.filter((_, idx) => idx !== i));
  const updateName = (i: number, val: string) =>
    setNames(prev => prev.map((n, idx) => (idx === i ? val : n)));
  const moveUp   = (i: number) =>
    setNames(prev => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  const moveDown = (i: number) =>
    setNames(prev => { const a = [...prev]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; return a; });

  const validNames = names.filter(n => n.trim());

  // ── Confirm helpers ───────────────────────────────────────────────────────

  const confirmManual = () => {
    const players = buildPlayers(names);
    if (players.length === 0) return;
    onSetup(players, players.map(p => p.id), "manual");
    onOpenChange(false);
  };

  const doRandomize = () => {
    const filtered = names.filter(n => n.trim());
    setShuffledNames(shuffleArray(filtered));
    setStep("auto-result");
  };

  const confirmAuto = () => {
    const players = buildPlayers(shuffledNames);
    if (players.length === 0) return;
    onSetup(players, players.map(p => p.id), "auto");
    onOpenChange(false);
  };

  const shuffleAgain = () => {
    setShuffledNames(prev => shuffleArray([...prev]));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderNameInputs = (reorderable: boolean) => (
    <div className="space-y-2">
      {names.map((name, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {reorderable && (
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground disabled:opacity-20"
                aria-label="Move up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveDown(i)}
                disabled={i === names.length - 1}
                className="p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground disabled:opacity-20"
                aria-label="Move down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <span className="text-xs text-muted-foreground/40 w-5 text-right shrink-0">{i + 1}.</span>
          <input
            type="text"
            value={name}
            onChange={e => updateName(i, e.target.value)}
            placeholder={`Player ${i + 1}`}
            className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
          />
          {names.length > 1 && (
            <button
              onClick={() => removeName(i)}
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              aria-label="Remove player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      {names.length < 8 && (
        <button
          onClick={addName}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors pl-[3.25rem]"
        >
          + Add player
        </button>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[88dvh] flex flex-col overflow-hidden p-0">

        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-xl font-medium">
            {step === "method" ? "Track whose turn it is?" : "Turn Keeper"}
          </DialogTitle>
          {step === "method" && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              Turn Keeper helps your group know who should read the next card.
            </p>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── Step: method ── */}
          {step === "method" && (
            <div className="space-y-2">
              <button
                onClick={() => setStep("manual")}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-xl border border-border/60 bg-card",
                  "hover:border-primary/40 hover:bg-secondary/30 transition-colors",
                )}
              >
                <p className="text-sm font-medium">Set order manually</p>
                <p className="text-xs text-muted-foreground/55 mt-0.5">Enter players in turn order.</p>
              </button>

              <button
                onClick={() => setStep("auto")}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-xl border border-border/60 bg-card",
                  "hover:border-primary/40 hover:bg-secondary/30 transition-colors",
                )}
              >
                <p className="text-sm font-medium">Randomize order</p>
                <p className="text-xs text-muted-foreground/55 mt-0.5">Enter players, then let the app shuffle.</p>
              </button>

              <button
                onClick={() => { onSkip?.(); onOpenChange(false); }}
                className="w-full px-4 py-3 text-sm text-muted-foreground/55 hover:text-muted-foreground transition-colors"
              >
                Skip for now
              </button>

              <p className="text-[10px] text-muted-foreground/35 text-center pt-2 leading-relaxed">
                Turn Keeper is stored locally on this device.
                Turn Keeper tracks whose turn it is, not what anyone says.
              </p>
            </div>
          )}

          {/* ── Step: manual ── */}
          {step === "manual" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground/60">
                Enter players in the order you want turns to go. Use the arrows to reorder.
              </p>
              {renderNameInputs(true)}
            </div>
          )}

          {/* ── Step: auto (names entry) ── */}
          {step === "auto" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground/60">
                Enter everyone's names. The app will randomize the order.
              </p>
              {renderNameInputs(false)}
            </div>
          )}

          {/* ── Step: auto-result ── */}
          {step === "auto-result" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground/60">Here's the randomized order:</p>
              <ol className="space-y-2">
                {shuffledNames.map((name, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono text-muted-foreground shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{name}</span>
                    {i < shuffledNames.length - 1 && (
                      <span className="text-muted-foreground/30 text-xs ml-auto">→</span>
                    )}
                  </li>
                ))}
              </ol>
              <button
                onClick={shuffleAgain}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/55 hover:text-muted-foreground transition-colors"
              >
                <Shuffle className="w-3 h-3" /> Shuffle again
              </button>
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div className="px-6 pb-6 pt-3 border-t border-border/40 shrink-0 space-y-2">
          {step === "method" && null}

          {step === "manual" && (
            <>
              <Button
                className="w-full"
                disabled={validNames.length === 0}
                onClick={confirmManual}
              >
                Start Turn Keeper
              </Button>
              {!isEdit && (
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep("method")}>
                  Back
                </Button>
              )}
            </>
          )}

          {step === "auto" && (
            <>
              <Button
                className="w-full"
                disabled={validNames.length === 0}
                onClick={doRandomize}
              >
                Randomize Order →
              </Button>
              {!isEdit && (
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep("method")}>
                  Back
                </Button>
              )}
            </>
          )}

          {step === "auto-result" && (
            <>
              <Button className="w-full" onClick={confirmAuto}>
                Use This Order
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep("auto")}>
                Edit names
              </Button>
            </>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
