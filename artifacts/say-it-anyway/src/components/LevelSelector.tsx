import React from "react";
import { cn } from "@/lib/utils";

interface LevelSelectorProps {
  activeLevel: number;
  onLevelChange: (level: number) => void;
}

const LEVELS = [
  { id: 1, label: "Read the Room" },
  { id: 2, label: "Beneath the Surface" },
  { id: 3, label: "Say It Anyway" },
] as const;

const LevelSelector = React.memo(function LevelSelector({ activeLevel, onLevelChange }: LevelSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-none px-2">
      {LEVELS.map(level => {
        const isActive = activeLevel === level.id;
        return (
          <button
            key={level.id}
            onClick={() => onLevelChange(level.id)}
            className={cn(
              "relative whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm rounded-full transition-all duration-200 outline-none",
              "active:scale-[0.96]",
              isActive
                ? "text-foreground font-medium bg-secondary/70"
                : "text-muted-foreground/70 hover:text-foreground/80 hover:bg-secondary/40",
            )}
          >
            {level.label}
            {isActive && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground/50" />
            )}
          </button>
        );
      })}
    </div>
  );
});

export default LevelSelector;
