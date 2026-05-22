import { Player } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface PlayerListProps {
  players: Player[];
  localPlayerId: string | null;
}

export default function PlayerList({ players, localPlayerId }: PlayerListProps) {
  // Only show players seen in the last 3 minutes
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  
  const activePlayers = players.filter(p => {
    const lastSeen = new Date(p.lastSeenAt);
    return lastSeen > threeMinutesAgo;
  });

  if (activePlayers.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mr-2">In Room:</span>
      {activePlayers.map(player => (
        <div 
          key={player.id}
          className={cn(
            "px-2 py-1 rounded-md text-xs font-medium border border-border/50",
            player.id === localPlayerId 
              ? "bg-primary/10 text-primary border-primary/20" 
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {player.displayName} {player.id === localPlayerId && "(You)"}
        </div>
      ))}
    </div>
  );
}
