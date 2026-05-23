import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsRight, Shuffle, RotateCcw } from "lucide-react";
import { Card as CardType } from "@/data/cardData";
import { cn } from "@/lib/utils";

// ── Module-level constants (not recreated on every render) ──────────────────

const VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 36 : -36, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -36 : 36, opacity: 0, scale: 0.97 }),
};

const TRANSITION = {
  x:       { type: "spring" as const, stiffness: 340, damping: 32 },
  opacity: { duration: 0.16 },
  scale:   { duration: 0.16 },
};

const LABEL_MAP: Record<string, string> = {
  classic:    "Classic",
  long_game:  "The Long Game",
  after_dark: "After Dark",
};

// ── Sub-components (module-level = not recreated, not anonymized) ───────────

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
        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors duration-150 min-w-[52px]",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        primary
          ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
      )}
      aria-label={label}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </button>
  );
});

// ── Main component ──────────────────────────────────────────────────────────

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
}

const PromptCard = React.memo(function PromptCard({
  card, totalCards, currentIndex,
  onNext, onPrev, onSkip, isEnd,
  onReshuffle, onReset, mode,
}: PromptCardProps) {
  const [direction, setDirection] = useState(1);

  const handleNext = () => { setDirection(1);  onNext(); };
  const handlePrev = () => { setDirection(-1); onPrev(); };
  const handleSkip = () => { setDirection(1);  onSkip(); };

  if (isEnd || !card) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
        <p className="text-xl font-serif text-muted-foreground">
          {!card && totalCards === 0
            ? "No cards available for this selection."
            : "You've reached the end of this deck."}
        </p>
        {totalCards > 0 && (
          <button
            onClick={onReshuffle}
            className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Reshuffle Deck
          </button>
        )}
      </div>
    );
  }

  // Derive label once per render (not inside JSX)
  const cardLabel =
    mode === "long_game" && card.relationship_context && card.relationship_context !== "all"
      ? `For ${card.relationship_context.replace(/_/g, " ")}`
      : card.level_name || LABEL_MAP[mode] || mode;

  // Pre-format tags (avoid inline replace in JSX)
  const displayTags = card.tags.slice(0, 2).map(t => t.replace(/_/g, " "));

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {mode === "after_dark" && (
        <p className="text-center text-xs font-medium text-muted-foreground tracking-widest uppercase opacity-60 mb-4">
          Skip freely. No explanations needed.
        </p>
      )}

      {/* Card face */}
      <div className="relative w-full" style={{ minHeight: "300px" }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={card.id}
            custom={direction}
            variants={VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={TRANSITION}
            style={{ willChange: "transform, opacity" }}
            className={cn(
              "w-full flex flex-col justify-center items-center text-center",
              "px-8 sm:px-14 py-12 sm:py-14",
              "bg-card text-card-foreground rounded-2xl border",
              "shadow-[0_6px_24px_-8px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.04)]",
            )}
          >
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-6">
              {cardLabel}
            </span>

            <h2 className="font-serif font-medium leading-snug text-balance text-xl sm:text-2xl lg:text-3xl max-w-prose">
              {card.prompt}
            </h2>

            {displayTags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {displayTags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action bar */}
      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <ControlBtn icon={<ChevronLeft  className="w-5 h-5" />} label="Prev"    onClick={handlePrev} disabled={currentIndex === 0} />
          <ControlBtn icon={<ChevronsRight className="w-5 h-5" />} label="Skip"   onClick={handleSkip} />

          <div className="px-3 py-2 min-w-[60px] text-center">
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {currentIndex + 1}<span className="opacity-40"> / </span>{totalCards}
            </span>
          </div>

          <ControlBtn icon={<Shuffle      className="w-5 h-5" />} label="Shuffle" onClick={onReshuffle} />
          <ControlBtn icon={<ChevronRight className="w-5 h-5" />} label="Next"    onClick={handleNext} primary />
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset to start
        </button>
      </div>
    </div>
  );
});

export default PromptCard;
