import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card as CardType } from "@/data/cardData";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  card: CardType | null;
  totalCards: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  isEnd: boolean;
  onReshuffle: () => void;
  mode: string;
}

export default function PromptCard({ 
  card, 
  totalCards, 
  currentIndex, 
  onNext, 
  onPrev, 
  isEnd,
  onReshuffle,
  mode
}: PromptCardProps) {
  const [direction, setDirection] = useState(1);
  const [lastCardId, setLastCardId] = useState<string | null>(null);

  useEffect(() => {
    if (card?.id && card.id !== lastCardId) {
      // Crude direction detection based on id change, usually we go forward
      setDirection(1); 
      setLastCardId(card.id);
    }
  }, [card?.id, lastCardId]);

  const handleNext = () => {
    setDirection(1);
    onNext();
  };

  const handlePrev = () => {
    setDirection(-1);
    onPrev();
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
      rotateY: direction > 0 ? 5 : -5,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      scale: 0.95,
      rotateY: direction > 0 ? -5 : 5,
    })
  };

  if (isEnd || !card) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
        <p className="text-xl font-serif text-muted-foreground">You've reached the end of this deck.</p>
        <button 
          onClick={onReshuffle}
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Reshuffle Deck
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-[3/4] sm:aspect-[4/5] perspective-1000 flex flex-col">
      {mode === "after_dark" && (
        <div className="absolute -top-10 left-0 w-full text-center text-xs font-medium text-muted-foreground tracking-widest uppercase opacity-70">
          Skip freely. No explanations needed.
        </div>
      )}
      
      <div className="flex-grow relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={card.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              rotateY: { duration: 0.4 }
            }}
            className={cn(
              "absolute inset-0 flex flex-col justify-center p-8 sm:p-12 text-center",
              "bg-card text-card-foreground rounded-2xl shadow-xl border border-card-border/50",
              "transform-style-3d overflow-hidden"
            )}
            style={{
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)"
            }}
          >
            {/* Card Content */}
            <div className="flex flex-col items-center space-y-8">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {mode === "long_game" && card.relationship_context !== "all" 
                  ? `For ${card.relationship_context.replace('_', ' ')}` 
                  : card.level_name || mode.replace('_', ' ')}
              </span>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium leading-tight text-balance">
                {card.prompt}
              </h2>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {card.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-border/50 text-muted-foreground">
                    {tag.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] rounded-2xl"></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between px-2 sm:px-0">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
          aria-label="Previous card"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        
        <div className="text-sm font-medium text-muted-foreground tracking-widest font-mono">
          {currentIndex + 1} / {totalCards}
        </div>
        
        <button 
          onClick={handleNext}
          className="p-3 text-foreground bg-primary/5 hover:bg-primary/10 rounded-full transition-colors"
          aria-label="Next card"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
