import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import HowToPlayModal from "@/components/HowToPlayModal";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  afterDarkUnlocked: boolean;
  onUnlockAfterDark: () => void;
  onLockAfterDark: () => void;
  onResetRoom: () => void;
}

const CARD_STATS = [
  { label: "Total", count: 850 },
  { label: "Classic", count: 450, children: [
    { label: "Read the Room", count: 150 },
    { label: "Beneath the Surface", count: 150 },
    { label: "Say It Anyway", count: 150 },
  ]},
  { label: "The Long Game", count: 200 },
  { label: "After Dark", count: 200 },
];

export default function SettingsModal({
  open,
  onOpenChange,
  roomCode,
  afterDarkUnlocked,
  onUnlockAfterDark,
  onLockAfterDark,
  onResetRoom,
}: SettingsModalProps) {
  const { toast } = useToast();
  const [secretCode, setSecretCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSecretCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSecretCode(val);
    if (val === "AFTERDARK" && !afterDarkUnlocked) {
      setSecretCode("");
      onUnlockAfterDark();
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium">Room Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-1 py-2">

            {/* Room Code */}
            <div className="space-y-2 pb-4 border-b border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Room Code</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-center tracking-[0.3em] text-lg font-medium">
                  {roomCode}
                </div>
                <Button
                  onClick={copyRoomCode}
                  variant="outline"
                  className={cn("px-4 min-w-[72px] transition-all", copied && "text-green-600 border-green-300")}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 py-4 border-b border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium"
                onClick={() => { setHowToPlayOpen(true); onOpenChange(false); }}
              >
                <span className="text-base">🎴</span> How to Play
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 text-sm font-medium"
                onClick={() => { onResetRoom(); onOpenChange(false); }}
              >
                <span className="text-base">↺</span> Reset Deck to Start
              </Button>
            </div>

            {/* After Dark */}
            <div className="py-4 border-b border-border">
              {afterDarkUnlocked ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-sm font-medium text-muted-foreground"
                  onClick={() => { onLockAfterDark(); onOpenChange(false); }}
                >
                  <span className="text-base">🔒</span> Lock After Dark
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Unlock After Dark</p>
                  <Input
                    placeholder="Enter secret code..."
                    value={secretCode}
                    onChange={handleSecretCode}
                    className="bg-background text-center tracking-widest uppercase"
                  />
                </div>
              )}
            </div>

            {/* Dev Stats — collapsed */}
            <div className="py-3 border-b border-border">
              <button
                onClick={() => setStatsOpen(v => !v)}
                className="w-full flex items-center justify-between text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <span className="uppercase tracking-widest font-medium">Card Stats</span>
                <span className={cn("transition-transform duration-200", statsOpen ? "rotate-180" : "")}>▾</span>
              </button>
              {statsOpen && (
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {CARD_STATS.map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between font-medium text-foreground/70">
                        <span>{stat.label}</span>
                        <span className="font-mono">{stat.count}</span>
                      </div>
                      {"children" in stat && stat.children && (
                        <div className="ml-3 mt-0.5 space-y-0.5">
                          {stat.children.map(child => (
                            <div key={child.label} className="flex justify-between">
                              <span>{child.label}</span>
                              <span className="font-mono">{child.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <div className="pt-3">
              <p className="text-xs text-muted-foreground/50 leading-relaxed">
                Made for better conversations.<br />
                Personal project under testing. Not for commercial use or public distribution without prior permission.
              </p>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      <HowToPlayModal open={howToPlayOpen} onOpenChange={setHowToPlayOpen} />
    </>
  );
}
