import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  activeMode: string;
  afterDarkUnlocked: boolean;
  onModeChange: (mode: string) => void;
}

export default function ModeSelector({ activeMode, afterDarkUnlocked, onModeChange }: ModeSelectorProps) {
  const modes = [
    { id: "classic", label: "Classic" },
    { id: "long_game", label: "The Long Game" },
    ...(afterDarkUnlocked ? [{ id: "after_dark", label: "After Dark" }] : [])
  ];

  return (
    <div className="flex items-center justify-center space-x-1 p-1 bg-secondary/50 rounded-full border border-border/50 max-w-fit mx-auto backdrop-blur-sm">
      {modes.map(mode => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={cn(
            "px-4 py-2 text-sm sm:text-base rounded-full font-medium transition-all duration-300",
            activeMode === mode.id 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
