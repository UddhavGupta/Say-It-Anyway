import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HowToPlayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HowToPlayModal({ open, onOpenChange }: HowToPlayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-medium">How to Play</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Take turns reading the card out loud. Anyone can answer, pass, or ask the question back.
          </p>
          <p>
            Skip freely.
          </p>
          <p className="text-foreground font-medium">
            The point is not to perform honesty. The point is to make the next honest thing easier to say.
          </p>
        </div>
        <Button
          className="w-full mt-2"
          onClick={() => onOpenChange(false)}
        >
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
}
