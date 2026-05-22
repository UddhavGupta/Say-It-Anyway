import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AfterDarkUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
}

export default function AfterDarkUnlockModal({ open, onOpenChange, onUnlock }: AfterDarkUnlockModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 text-zinc-50 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-medium text-center" style={{ color: "hsl(340 35% 55%)" }}>
            Unlock After Dark?
          </DialogTitle>
          <DialogDescription className="text-center pt-4 text-zinc-400 text-base space-y-3">
            <span className="block">
              After Dark includes spicy prompts intended for consenting adults. Play respectfully.
              Anyone can skip any card, anytime.
            </span>
            <span className="block text-zinc-500">
              No pressure. No explanations needed.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onUnlock();
              onOpenChange(false);
            }}
            className="w-full text-white"
            style={{ backgroundColor: "hsl(340 35% 32%)" }}
          >
            Unlock After Dark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
