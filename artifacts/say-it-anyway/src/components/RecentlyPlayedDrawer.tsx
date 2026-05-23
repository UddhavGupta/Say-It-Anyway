import React from "react";
import { Bookmark, BookmarkCheck, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlayedCard } from "@/hooks/useSessionMemory";
import { cn } from "@/lib/utils";

interface RecentlyPlayedDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PlayedCard[];
  savedCardIds: Set<string>;
  onReplay: (card: PlayedCard) => void;
  onAskAgainLater: (card: PlayedCard) => void;
  onNotForThisRoom: (card: PlayedCard) => void;
}

const MODE_LABELS: Record<string, string> = {
  classic:    "Classic",
  long_game:  "The Long Game",
  after_dark: "After Dark",
};

function cardMeta(card: PlayedCard): string {
  const mode = MODE_LABELS[card.mode] ?? card.mode;
  if (card.levelName && card.levelName !== mode) return `${mode} · ${card.levelName}`;
  return mode;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 90_000)      return "just now";
  if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)} min ago`;
  return "earlier";
}

const RecentlyPlayedDrawer = React.memo(function RecentlyPlayedDrawer({
  open, onOpenChange, items, savedCardIds,
  onReplay, onAskAgainLater, onNotForThisRoom,
}: RecentlyPlayedDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85dvh] flex flex-col overflow-hidden p-0">

        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-xl font-medium">Recently Played</DialogTitle>
          <p className="text-xs text-muted-foreground/55 mt-0.5">
            Cards from this session — answers are never recorded.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground/50">No recently played cards yet.</p>
              <p className="text-xs text-muted-foreground/35 mt-1">Cards appear here as you play.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map(card => {
                const saved = savedCardIds.has(card.cardId);
                return (
                  <li key={card.cardId} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">

                    {/* Meta + timestamp */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                        {cardMeta(card)}
                      </span>
                      <span className="text-[10px] text-muted-foreground/35 shrink-0">
                        {relativeTime(card.playedAt)}
                      </span>
                    </div>

                    {/* Prompt */}
                    <p className="font-serif text-sm leading-relaxed text-card-foreground">
                      {card.prompt}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <button
                        onClick={() => { onReplay(card); onOpenChange(false); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-85 active:scale-[0.97] transition-all"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Replay
                      </button>

                      <button
                        onClick={() => onAskAgainLater(card)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          saved
                            ? "border-primary/30 text-primary/60 bg-primary/6"
                            : "border-border/60 text-muted-foreground hover:text-foreground",
                        )}
                        aria-label={saved ? "Already in Worth Revisiting" : "Ask again later"}
                      >
                        {saved
                          ? <><BookmarkCheck className="w-3 h-3" /> Saved</>
                          : <><Bookmark className="w-3 h-3" /> Ask Again Later</>
                        }
                      </button>

                      <button
                        onClick={() => onNotForThisRoom(card)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-muted-foreground/45 hover:text-muted-foreground/70 transition-colors ml-auto"
                        aria-label="Not for this room"
                      >
                        <X className="w-3 h-3" />
                        Not for this room
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
});

export default RecentlyPlayedDrawer;
