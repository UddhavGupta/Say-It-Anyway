import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ChevronsRight, Shuffle, RotateCcw,
  Bookmark, BookmarkCheck, History,
} from "lucide-react";
import { Card as CardType } from "@/data/cardData";
import { cn } from "@/lib/utils";

// ── Module-level constants ────────────────────────────────────────────────────

const VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0, scale: 0.975 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0, scale: 0.975 }),
};

const TRANSITION = {
  x:       { type: "spring" as const, stiffness: 360, damping: 34 },
  opacity: { duration: 0.14 },
  scale:   { duration: 0.14 },
};

const LABEL_MAP: Record<string, string> = {
  classic:    "Classic",
  long_game:  "The Long Game",
  after_dark: "After Dark",
};

const BADGE_STYLES: Record<string, string> = {
  classic:    "border-border/50 text-muted-foreground/65 bg-background/60",
  long_game:  "border-blue-950/15 text-blue-950/45 bg-background/60",
  after_dark: "border-rose-900/25 text-rose-400/60 bg-background/40",
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface ControlBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}

const ControlBtn = React.memo(function ControlBtn({
  icon, label, onClick, disabled, primary,
}: ControlBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 min-w-[52px]",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        "active:scale-[0.94]",
        primary
          ? "bg-primary text-primary-foreground hover:opacity-85 shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/70",
      )}
      aria-label={label}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </button>
  );
});

// ── Main component ────────────────────────────────────────────────────────────

interface PromptCardProps {
  card: CardType | null;
  totalCards: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onReshuffle: () => void;
  onReset: () => void;
  isEnd: boolean;
  mode: string;
  // Memory features (all optional — omitting hides the memory UI)
  onAskAgainLater?: () => void;
  onNotForThisRoom?: () => void;
  onOpenRecentlyPlayed?: () => void;
  recentlyPlayedCount?: number;
  isInWorthRevisiting?: boolean;
  isReplaying?: boolean;
}

const PromptCard = React.memo(function PromptCard({
  card, totalCards, currentIndex,
  onNext, onPrev, onSkip, isEnd,
  onReshuffle, onReset, mode,
  onAskAgainLater, onNotForThisRoom, onOpenRecentlyPlayed,
  recentlyPlayedCount = 0,
  isInWorthRevisiting = false,
  isReplaying = false,
}: PromptCardProps) {
  const [direction, setDirection] = useState(1);

  const handleNext = () => { setDirection(1);  onNext(); };
  const handlePrev = () => { setDirection(-1); onPrev(); };
  const handleSkip = () => { setDirection(1);  onSkip(); };

  if (isEnd || !card) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
        <div className="relative w-20 h-28 mx-auto mb-2" aria-hidden="true">
          <div className="absolute inset-0 rounded-xl bg-card border border-border/50" style={{ transform: "rotate(2deg)", opacity: 0.45 }} />
          <div className="absolute inset-0 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <span className="font-serif text-3xl text-foreground/20" style={{ lineHeight: 1 }}>&ldquo;</span>
          </div>
        </div>
        <p className="text-xl font-serif text-muted-foreground">
          {!card && totalCards === 0
            ? "No cards available for this selection."
            : "You've reached the end of this deck."}
        </p>
        {totalCards > 0 && (
          <button
            onClick={onReshuffle}
            className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Reshuffle Deck
          </button>
        )}
      </div>
    );
  }

  const cardLabel =
    mode === "long_game" && card.relationship_context && card.relationship_context !== "all"
      ? `For ${card.relationship_context.replace(/_/g, " ")}`
      : card.level_name || LABEL_MAP[mode] || mode;

  const displayTags = card.tags.slice(0, 2).map(t => t.replace(/_/g, " "));
  const badgeStyle = BADGE_STYLES[mode] ?? BADGE_STYLES.classic;

  const hasMemoryActions = !!(onAskAgainLater || onOpenRecentlyPlayed || onNotForThisRoom);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {mode === "after_dark" && (
        <p className="text-center text-xs font-medium text-muted-foreground/50 tracking-widest uppercase mb-3">
          Skip freely · No explanations needed
        </p>
      )}

      {/* Card + stacked effect */}
      <div className="relative w-full">
        {/* Stacked decorative cards */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-[var(--card-stack-tint)] border border-border/55"
          style={{ transform: "rotate(1.4deg) translateY(5px)", opacity: 0.65, zIndex: 1 }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-[var(--card-stack-tint)] border border-border/40"
          style={{ transform: "rotate(-0.7deg) translateY(9px)", opacity: 0.38, zIndex: 0 }}
        />

        {/* Main animated card */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${card.id}${isReplaying ? "-replay" : ""}`}
            custom={direction}
            variants={VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={TRANSITION}
            style={{ willChange: "transform, opacity", position: "relative", zIndex: 2 }}
            className={cn(
              "w-full flex flex-col justify-center items-center text-center",
              "px-8 sm:px-14 py-10 sm:py-14",
              "bg-card text-card-foreground rounded-2xl border border-card-border/80",
              "shadow-[0_8px_32px_-10px_rgba(0,0,0,0.13),0_2px_8px_-3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]",
              "overflow-hidden",
            )}
          >
            {/* Quote watermark */}
            <span
              className="absolute -top-4 left-3 font-serif leading-none select-none pointer-events-none text-foreground/[0.05]"
              style={{ fontSize: "8rem" }}
              aria-hidden="true"
            >
              &ldquo;
            </span>

            {/* Badge row: mode/level + optional Replay indicator */}
            <div className="relative z-10 flex items-center justify-center gap-2 mb-5">
              <span className={cn(
                "text-[10px] font-medium uppercase tracking-widest px-2.5 py-[3px] rounded-full border",
                badgeStyle,
              )}>
                {cardLabel}
              </span>
              {isReplaying && (
                <span className="text-[10px] font-medium uppercase tracking-widest px-2.5 py-[3px] rounded-full border border-primary/30 bg-primary/8 text-primary/60">
                  ↩ Replay
                </span>
              )}
            </div>

            {/* Prompt */}
            <h2 className="relative z-10 font-serif font-medium leading-[1.45] text-balance text-xl sm:text-2xl lg:text-3xl max-w-prose">
              {card.prompt}
            </h2>

            {/* Tags */}
            {displayTags.length > 0 && (
              <div className="relative z-10 flex flex-wrap justify-center gap-1.5 mt-7">
                {displayTags.map(tag => (
                  <span
                    key={tag}
                    className="text-[9px] uppercase tracking-wider px-2.5 py-[3px] rounded-full border border-border/45 text-muted-foreground/55 bg-background/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main action bar */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <ControlBtn icon={<ChevronLeft   className="w-5 h-5" />} label="Prev"    onClick={handlePrev}    disabled={currentIndex === 0 && !isReplaying} />
          <ControlBtn icon={<ChevronsRight  className="w-5 h-5" />} label="Skip"   onClick={handleSkip} />

          <div className="px-3 py-2 min-w-[60px] text-center">
            {isReplaying ? (
              <span className="text-[10px] font-medium text-primary/50 uppercase tracking-wider">replay</span>
            ) : (
              <span className="text-xs font-mono text-muted-foreground/60 tabular-nums">
                {currentIndex + 1}<span className="opacity-40"> / </span>{totalCards}
              </span>
            )}
          </div>

          <ControlBtn icon={<Shuffle        className="w-5 h-5" />} label="Shuffle" onClick={onReshuffle} />
          <ControlBtn icon={<ChevronRight  className="w-5 h-5" />} label="Next"    onClick={handleNext}    primary />
        </div>

        {/* Memory action row */}
        {hasMemoryActions && (
          <div className="flex items-center justify-center gap-5">
            {onAskAgainLater && (
              <button
                onClick={onAskAgainLater}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] transition-colors",
                  isInWorthRevisiting
                    ? "text-primary/55 hover:text-primary/75"
                    : "text-muted-foreground/45 hover:text-muted-foreground/75",
                )}
                aria-label={isInWorthRevisiting ? "Already saved" : "Ask again later"}
              >
                {isInWorthRevisiting
                  ? <BookmarkCheck className="w-3 h-3" />
                  : <Bookmark className="w-3 h-3" />
                }
                {isInWorthRevisiting ? "Saved" : "Ask Again Later"}
              </button>
            )}
            {onOpenRecentlyPlayed && (
              <button
                onClick={onOpenRecentlyPlayed}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground/45 hover:text-muted-foreground/75 transition-colors"
                aria-label="Recently played"
              >
                <History className="w-3 h-3" />
                {recentlyPlayedCount > 0 ? `History (${recentlyPlayedCount})` : "History"}
              </button>
            )}
          </div>
        )}

        {/* Reset + Not for this room */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to start
          </button>
          {onNotForThisRoom && (
            <>
              <span className="text-muted-foreground/20 text-xs" aria-hidden="true">·</span>
              <button
                onClick={onNotForThisRoom}
                className="text-[11px] text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors"
                aria-label="Remove from this session"
              >
                Not for this room
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default PromptCard;
