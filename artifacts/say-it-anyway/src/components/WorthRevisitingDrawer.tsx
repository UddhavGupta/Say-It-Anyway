import React from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SavedCard } from "@/hooks/useSessionMemory";

interface WorthRevisitingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SavedCard[];
  privateMode: boolean;
  onReplay: (card: SavedCard) => void;
  onRemove: (cardId: string) => void;
}

const MODE_LABELS: Record<string, string> = {
  classic:    "Classic",
  long_game:  "The Long Game",
  after_dark: "After Dark",
};

function cardMeta(card: SavedCard): string {
  const mode = MODE_LABELS[card.mode] ?? card.mode;
  if (card.levelName && card.levelName !== mode) return `${mode} · ${card.levelName}`;
  return mode;
}

function formatSavedDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const WorthRevisitingDrawer = React.memo(function WorthRevisitingDrawer({
  open, onOpenChange, items, privateMode, onReplay, onRemove,
}: WorthRevisitingDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85dvh] flex flex-col overflow-hidden p-0">

        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-xl font-medium">Worth Revisiting</DialogTitle>
          <p className="text-xs text-muted-foreground/55 mt-0.5">
            Prompts you saved for later. Answers are never recorded.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          {privateMode ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm text-muted-foreground/55">Private Mode is on.</p>
              <p className="text-xs text-muted-foreground/35">
                Saved prompts are disabled while Private Mode is active.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-1">
              <p className="text-sm text-muted-foreground/50">Nothing saved for later yet.</p>
              <p className="text-xs text-muted-foreground/35 mt-1">
                Tap "Ask Again Later" on any card to save it here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map(card => (
                <li key={card.cardId} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">

                  {/* Meta + date */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                      {cardMeta(card)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/35 shrink-0">
                      Saved {formatSavedDate(card.savedAt)}
                    </span>
                  </div>

                  {/* Prompt */}
                  <p className="font-serif text-sm leading-relaxed text-card-foreground">
                    {card.prompt}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => { onReplay(card); onOpenChange(false); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-85 active:scale-[0.97] transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Play Now
                    </button>

                    <button
                      onClick={() => onRemove(card.cardId)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground/50 hover:text-destructive border border-border/50 hover:border-destructive/30 transition-colors ml-auto"
                      aria-label="Remove from Worth Revisiting"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!privateMode && items.length > 0 && (
          <div className="px-5 py-3 border-t border-border/40 shrink-0">
            <p className="text-[10px] text-muted-foreground/35 text-center">
              Saved prompts live only on this device.
            </p>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
});

export default WorthRevisitingDrawer;
