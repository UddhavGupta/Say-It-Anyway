import { cn } from "@/lib/utils";

interface LevelSelectorProps {
  activeLevel: number;
  onLevelChange: (level: number) => void;
}

export default function LevelSelector({ activeLevel, onLevelChange }: LevelSelectorProps) {
  const levels = [
    { id: 1, label: "Read the Room", short: "L1" },
    { id: 2, label: "Beneath the Surface", short: "L2" },
    { id: 3, label: "Say It Anyway", short: "L3" }
  ];

  return (
    <div className="flex items-center justify-center space-x-4">
      {levels.map(level => (
        <button
          key={level.id}
          onClick={() => onLevelChange(level.id)}
          className={cn(
            "relative px-2 py-1 text-sm transition-colors duration-300 outline-none focus:outline-none",
            activeLevel === level.id 
              ? "text-foreground font-medium" 
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          <span className="hidden sm:inline">{level.label}</span>
          <span className="sm:hidden">{level.short}</span>
          {activeLevel === level.id && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground rounded-full"></span>
          )}
        </button>
      ))}
    </div>
  );
}
