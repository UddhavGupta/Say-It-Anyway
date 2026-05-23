import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AfterDarkUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
}

function calculateAge(day: number, month: number, year: number): number {
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function AfterDarkUnlockModal({ open, onOpenChange, onUnlock }: AfterDarkUnlockModalProps) {
  const [month, setMonth] = useState("");
  const [day,   setDay]   = useState("");
  const [year,  setYear]  = useState("");
  const [step,  setStep]  = useState<"birthday" | "consent">("birthday");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMonth("");
    setDay("");
    setYear("");
    setStep("birthday");
    setError(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  function handleVerify() {
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);

    if (
      !m || !d || !y ||
      m < 1 || m > 12 ||
      d < 1 || d > 31 ||
      y < 1900 || y > new Date().getFullYear()
    ) {
      setError("Please enter a valid date of birth.");
      return;
    }

    if (calculateAge(d, m, y) < 18) {
      setError("You must be 18 or older to unlock After Dark.");
      return;
    }

    setError(null);
    setStep("consent");
  }

  function handleUnlock() {
    onUnlock();
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 text-zinc-50 border-zinc-800">

        {step === "birthday" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-medium text-center" style={{ color: "hsl(340 35% 55%)" }}>
                Age Verification
              </DialogTitle>
              <DialogDescription className="text-center pt-3 text-zinc-400 text-sm">
                After Dark is for adults only. Enter your date of birth to continue.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 mt-2">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-medium block mb-1.5">Month</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="MM"
                  min={1}
                  max={12}
                  value={month}
                  onChange={e => { setMonth(e.target.value); setError(null); }}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 text-center placeholder:text-zinc-600"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-medium block mb-1.5">Day</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="DD"
                  min={1}
                  max={31}
                  value={day}
                  onChange={e => { setDay(e.target.value); setError(null); }}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 text-center placeholder:text-zinc-600"
                />
              </div>
              <div className="flex-[1.6]">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-medium block mb-1.5">Year</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="YYYY"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={year}
                  onChange={e => { setYear(e.target.value); setError(null); }}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 text-center placeholder:text-zinc-600"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-400 text-center mt-1">{error}</p>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                className="w-full text-white"
                style={{ backgroundColor: "hsl(340 35% 32%)" }}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
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
                onClick={() => handleOpenChange(false)}
                className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnlock}
                className="w-full text-white"
                style={{ backgroundColor: "hsl(340 35% 32%)" }}
              >
                Unlock After Dark
              </Button>
            </DialogFooter>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
