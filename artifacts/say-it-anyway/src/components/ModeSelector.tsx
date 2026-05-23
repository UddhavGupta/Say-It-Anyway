import React from "react";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  activeMode: string;
  afterDarkUnlocked: boolean;
  onModeChange: (mode: string) => void;
}

const BASE_MODES = [
  { id: "classic",   label: "Classic" },
  { id: "long_game", label: "The Long Game" },
] as const;

const AFTER_DARK_MODE = { id: "after_dark", label: "After Dark" } as const;

const ModeSelector = React.memo(function ModeSelector({
  activeMode, afterDarkUnlocked, onModeChange,
}: ModeSelectorProps) {
  return (
    <div className="flex items-center justify-center overflow-x-auto scrollbar-none">
      <div className="flex items-center space-x-1 p-1 bg-secondary/60 rounded-full border border-border/50 shrink-0">
        {BASE_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "whitespace-nowrap px-4 py-1.5 text-sm sm:text-base rounded-full font-medium transition-colors duration-200",
              activeMode === mode.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
          >
            {mode.label}
          </button>
        ))}
        {afterDarkUnlocked && (
          <button
            onClick={() => onModeChange(AFTER_DARK_MODE.id)}
            className={cn(
              "whitespace-nowrap px-4 py-1.5 text-sm sm:text-base rounded-full font-medium transition-colors duration-200",
              activeMode === AFTER_DARK_MODE.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
          >
            {AFTER_DARK_MODE.label}
          </button>
        )}
      </div>
    </div>
  );
});

export default ModeSelector;
