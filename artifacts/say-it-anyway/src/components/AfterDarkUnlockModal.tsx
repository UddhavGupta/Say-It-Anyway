import { useState } from "react";
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
          <DialogTitle className="text-2xl font-serif font-medium text-center text-red-500">Unlock After Dark?</DialogTitle>
          <DialogDescription className="text-center pt-4 text-zinc-400 text-base">
            After Dark includes spicy prompts intended for consenting adults. Play respectfully. 
            <br/><br/>
            <span className="font-medium text-zinc-300">Anyone can skip any card, anytime.</span>
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
            className="w-full bg-red-900 hover:bg-red-800 text-white"
          >
            Unlock After Dark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
