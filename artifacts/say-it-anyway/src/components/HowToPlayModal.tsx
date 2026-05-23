import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HowToPlayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">{title}</h3>
      {children}
    </div>
  );
}

export default function HowToPlayModal({ open, onOpenChange }: HowToPlayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[88dvh] flex flex-col overflow-hidden p-0">

        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-2xl font-medium">How to Play</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-xs text-muted-foreground leading-relaxed">

          <Section title="How to play">
            <p>
              Pick a mode, read the card out loud, answer honestly, and pass the device around if
              you're playing on one screen.
            </p>
          </Section>

          <div className="border-t border-border/40" />

          <Section title="Playing on this device">
            <p>
              Best for dates, small groups, dinners, road trips, or passing one phone around.
              No setup required — just tap Start Playing and go.
            </p>
          </Section>

          <div className="border-t border-border/40" />

          <Section title="Multiplayer in the same room">
            <p>
              Use a room code when multiple people want to open the same session on their own devices.
            </p>
            <p className="text-muted-foreground/50 italic">
              Room-code syncing is experimental in this build.
            </p>
          </Section>

          <div className="border-t border-border/40" />

          <Section title="Modes">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground/75 mb-1">Classic</p>
                <ul className="space-y-1 ml-1">
                  {[
                    ["Read the Room", "light and playful"],
                    ["Beneath the Surface", "personal and reflective"],
                    ["Say It Anyway", "honest and vulnerable"],
                  ].map(([level, desc]) => (
                    <li key={level} className="flex items-start gap-2">
                      <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                      <span><span className="text-foreground/70">{level}:</span> {desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground/75 mb-1">The Long Game</p>
                <ul className="space-y-1 ml-1">
                  {["Couples", "Close Friends", "Dating", "All — mixes all three contexts"].map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground/75 mb-1">After Dark</p>
                <ul className="space-y-1 ml-1">
                  {[
                    "Hidden until unlocked in Settings",
                    "Intended for consenting adults",
                    "Skip freely — no explanation needed",
                  ].map(t => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <div className="border-t border-border/40" />

          <Section title="Tips">
            <ul className="space-y-1.5 ml-1">
              {[
                "Start with Classic if you're unsure.",
                "Use The Long Game when you already know each other.",
                "Use After Dark only when everyone is comfortable.",
                "Skip any card that doesn't fit the room.",
                "Good conversations don't need perfect answers.",
              ].map(tip => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Section>

          <div className="border-t border-border/40" />

          <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
            Personal project under testing. Do not enter sensitive personal information. Card responses
            are not recorded by the app.
          </p>

        </div>

        <div className="px-6 pb-6 pt-4 border-t border-border shrink-0">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
