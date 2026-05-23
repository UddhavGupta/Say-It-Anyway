import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SavedCard } from "@/hooks/useSessionMemory";
import { cn } from "@/lib/utils";

const MODE_LABELS: Record<string, string> = {
  classic:    "Classic",
  long_game:  "The Long Game",
  after_dark: "After Dark",
};

export interface SessionStats {
  cardsPlayed: number;
  modesUsed: string[];
  worthRevisitingCount: number;
  notForThisRoomCount: number;
}

interface EndSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: SessionStats;
  worthRevisitingThisSession: SavedCard[];
  onNewSession: () => void;
  onReturn: () => void;
  onClearSession: () => void;
}

interface StatRowProps {
  label: string;
  value: string | number;
  muted?: boolean;
}

function StatRow({ label, value, muted }: StatRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between py-2 text-sm",
      muted ? "text-muted-foreground/50" : "text-foreground/80",
    )}>
      <span>{label}</span>
      <span className={cn("font-mono font-medium", muted && "text-muted-foreground/40")}>
        {value}
      </span>
    </div>
  );
}

const EndSessionModal = React.memo(function EndSessionModal({
  open, onOpenChange,
  stats, worthRevisitingThisSession,
  onNewSession, onReturn, onClearSession,
}: EndSessionModalProps) {
  const modeList = stats.modesUsed.length > 0
    ? stats.modesUsed.map(m => MODE_LABELS[m] ?? m).join(", ")
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[85dvh] flex flex-col overflow-hidden p-0">

        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-2xl font-medium">Session Summary</DialogTitle>
          <p className="text-xs text-muted-foreground/55 mt-1">
            No answers were recorded.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Stats */}
          <div className="divide-y divide-border/40">
            <StatRow label="Cards played" value={stats.cardsPlayed} />
            <StatRow label="Mode" value={modeList} />
            {stats.worthRevisitingCount > 0 && (
              <StatRow label="Saved for later" value={stats.worthRevisitingCount} />
            )}
            {stats.notForThisRoomCount > 0 && (
              <StatRow label="Skipped for this room" value={stats.notForThisRoomCount} muted />
            )}
          </div>

          {/* Worth Revisiting from this session */}
          {worthRevisitingThisSession.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                Saved This Session
              </p>
              <ul className="space-y-2">
                {worthRevisitingThisSession.slice(0, 5).map(card => (
                  <li key={card.cardId} className="rounded-lg border border-border/50 bg-card px-3 py-2.5">
                    <p className="font-serif text-xs leading-relaxed text-card-foreground line-clamp-2">
                      {card.prompt}
                    </p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">
                      {MODE_LABELS[card.mode] ?? card.mode}
                    </p>
                  </li>
                ))}
                {worthRevisitingThisSession.length > 5 && (
                  <p className="text-xs text-muted-foreground/40 text-center">
                    +{worthRevisitingThisSession.length - 5} more in Worth Revisiting
                  </p>
                )}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground/35 leading-relaxed pt-1">
            Saved prompts live only on this device. Private Mode prevents any prompt history from being stored.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border/40 space-y-2 shrink-0">
          <Button className="w-full" onClick={() => { onNewSession(); onOpenChange(false); }}>
            Start New Session
          </Button>
          <Button variant="outline" className="w-full" onClick={() => { onReturn(); onOpenChange(false); }}>
            Return to Game
          </Button>
          <button
            onClick={() => { onClearSession(); onOpenChange(false); }}
            className="w-full py-2 text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            Clear session data
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
});

export default EndSessionModal;
