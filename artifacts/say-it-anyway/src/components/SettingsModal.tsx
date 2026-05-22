import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  afterDarkUnlocked: boolean;
  onUnlockAfterDark: () => void;
  onLockAfterDark: () => void;
  onResetRoom: () => void;
}

export default function SettingsModal({ 
  open, 
  onOpenChange, 
  roomCode, 
  afterDarkUnlocked,
  onUnlockAfterDark,
  onLockAfterDark,
  onResetRoom
}: SettingsModalProps) {
  const { toast } = useToast();
  const [secretCode, setSecretCode] = useState("");

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({ title: "Room code copied" });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-medium">Room Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Room Code</Label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-center tracking-widest text-lg">
                {roomCode}
              </div>
              <Button onClick={copyRoomCode} variant="outline" className="px-3">
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Button onClick={() => {
              onResetRoom();
              onOpenChange(false);
            }} variant="outline" className="w-full">
              Reset Deck to Beginning
            </Button>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            {afterDarkUnlocked ? (
              <div className="flex items-center justify-between">
                <Label htmlFor="lock-after-dark" className="text-muted-foreground">After Dark Unlocked</Label>
                <Switch 
                  id="lock-after-dark" 
                  checked={afterDarkUnlocked}
                  onCheckedChange={(checked) => !checked && onLockAfterDark()}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest">Secret Code</Label>
                <Input 
                  placeholder="Enter code to unlock..." 
                  value={secretCode}
                  onChange={handleSecretCode}
                  className="bg-background text-center tracking-widest uppercase"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
