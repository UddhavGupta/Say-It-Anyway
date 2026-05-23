import React, { useState } from "react";
import { ChevronDown, ChevronUp, SkipForward, RotateCcw, Shuffle, Settings2, X } from "lucide-react";
import { TurnPlayer } from "@/hooks/useTurnKeeper";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TurnKeeperPanelProps {
  currentPlayer: TurnPlayer | null;
  nextPlayer: TurnPlayer | null;
  players: TurnPlayer[];
  turnOrder: string[];
  currentTurnIndex: number;
  onPassTurn: () => void;
  onResetTurns: () => void;
  onShuffleOrder: () => void;
  onEdit: () => void;
}

interface TurnKeeperTipProps {
  onDismiss: () => void;
}

// ── Tip banner ────────────────────────────────────────────────────────────────

export const TurnKeeperTip = React.memo(function TurnKeeperTip({ onDismiss }: TurnKeeperTipProps) {
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground/70 leading-relaxed">
      <span className="shrink-0 mt-px">💡</span>
      <span className="flex-1">
        <span className="font-medium text-foreground/60">Turn Keeper on.</span>
        {" "}Tap <span className="font-medium">Skip</span> to try a new question without changing whose turn it is.
        Tap <span className="font-medium">Next</span> when this turn is done.
      </span>
      <button
        onClick={onDismiss}
        className="shrink-0 mt-px text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        aria-label="Dismiss tip"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

// ── Panel ─────────────────────────────────────────────────────────────────────

const TurnKeeperPanel = React.memo(function TurnKeeperPanel({
  currentPlayer, nextPlayer,
  players, turnOrder, currentTurnIndex,
  onPassTurn, onResetTurns, onShuffleOrder, onEdit,
}: TurnKeeperPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const name = currentPlayer?.name ?? "—";
  const effectiveIndex = currentTurnIndex % Math.max(turnOrder.length, 1);

  if (!currentPlayer) return null;

  return (
    <div className={cn(
      "rounded-xl border border-border/60 bg-card/80 overflow-hidden transition-all duration-200",
      expanded ? "shadow-sm" : "",
    )}>
      {/* ── Collapsed / header row ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-secondary/20 transition-colors"
        aria-expanded={expanded}
      >
        <span className="text-base leading-none" aria-hidden="true">👤</span>
        <span className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground/80">{name}'s turn to ask</span>
          {nextPlayer && (
            <span className="text-xs text-muted-foreground/50 ml-2">
              → {nextPlayer.name}
            </span>
          )}
        </span>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
        }
      </button>

      {/* ── Expanded ── */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">

          {/* Order chips */}
          {turnOrder.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {turnOrder.map((id, i) => {
                const player = players.find(p => p.id === id);
                const isCurrent = i === effectiveIndex;
                return (
                  <React.Fragment key={id}>
                    <span className={cn(
                      "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}>
                      {player?.name ?? "?"}
                    </span>
                    {i < turnOrder.length - 1 && (
                      <span className="shrink-0 text-muted-foreground/30 text-[10px]">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onPassTurn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-85 active:scale-[0.97] transition-all"
            >
              <SkipForward className="w-3 h-3" />
              Pass Turn
            </button>

            <button
              onClick={onResetTurns}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground border border-border/50 hover:border-border transition-colors"
              aria-label="Reset to first player"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>

            <button
              onClick={onShuffleOrder}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground border border-border/50 hover:border-border transition-colors"
              aria-label="Shuffle turn order"
            >
              <Shuffle className="w-3 h-3" /> Shuffle
            </button>

            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground border border-border/50 hover:border-border transition-colors ml-auto"
              aria-label="Edit turn order"
            >
              <Settings2 className="w-3 h-3" /> Edit
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground/30 leading-relaxed">
            Turn Keeper is stored on this device only.
          </p>
        </div>
      )}
    </div>
  );
});

export default TurnKeeperPanel;
