import React from "react";
import { Sparkles, Compass, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  activeMode: string;
  afterDarkUnlocked: boolean;
  onModeChange: (mode: string) => void;
}

const BASE_MODES = [
  { id: "classic",   label: "Classic",       icon: Sparkles },
  { id: "long_game", label: "The Long Game", icon: Compass  },
] as const;

const AFTER_DARK_MODE = { id: "after_dark", label: "After Dark", icon: Moon } as const;

const ModeSelector = React.memo(function ModeSelector({
  activeMode, afterDarkUnlocked, onModeChange,
}: ModeSelectorProps) {
  const modes = afterDarkUnlocked
    ? [...BASE_MODES, AFTER_DARK_MODE]
    : [...BASE_MODES];

  return (
    <div className="flex items-center justify-center overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-0.5 p-1 bg-secondary/50 rounded-full border border-border/40 shrink-0">
        {modes.map(mode => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 text-sm rounded-full font-medium transition-all duration-200",
                "active:scale-[0.96]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground/80 hover:text-foreground hover:bg-secondary/80",
              )}
            >
              <Icon className="w-3 h-3 shrink-0" />
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default ModeSelector;
