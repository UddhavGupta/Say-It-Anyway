import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const INTRO_SEEN_KEY = "hasSeenGameIntro";

interface GameIntroModalProps {
  open: boolean;
  onStart: () => void;
  onDismiss: () => void;
}

interface ModeBlockProps {
  title: string;
  tag: string;
  tagColor: string;
  children: React.ReactNode;
}

function ModeBlock({ title, tag, tagColor, children }: ModeBlockProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <span className={cn(
          "text-[10px] font-mono font-medium px-2 py-0.5 rounded tracking-wider",
          tagColor,
        )}>
          {tag}
        </span>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const GameIntroModal = React.memo(function GameIntroModal({
  open, onStart, onDismiss,
}: GameIntroModalProps) {
  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onDismiss(); }}>
      <DialogContent className="sm:max-w-md max-h-[88dvh] flex flex-col overflow-hidden p-0">

        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-2xl font-medium leading-snug">
            Choose the conversation you want to have
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Classic */}
          <ModeBlock title="Classic" tag="Classic" tagColor="bg-primary/8 text-primary">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Start here. Classic has three levels:
            </p>
            <ul className="space-y-1.5 ml-1">
              {[
                ["Read the Room", "light, playful, easy-entry questions"],
                ["Beneath the Surface", "more personal stories, values, and patterns"],
                ["Say It Anyway", "honest, reflective, more vulnerable prompts"],
              ].map(([level, desc]) => (
                <li key={level} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                  <span><span className="text-foreground/80 font-medium">{level}:</span> {desc}</span>
                </li>
              ))}
            </ul>
          </ModeBlock>

          <div className="border-t border-border/40" />

          {/* The Long Game */}
          <ModeBlock title="The Long Game" tag="Long Game" tagColor="bg-blue-950/10 text-blue-900/70 dark:bg-blue-400/10 dark:text-blue-300">
            <p className="text-xs text-muted-foreground leading-relaxed">
              For people who already know each other. Use this for couples, close friends, or people
              who have been on several dates and want better questions than the usual basics.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Filter by who you're with:
            </p>
            <ul className="space-y-1 ml-1">
              {[
                ["Couples", "questions built for partnership and shared life"],
                ["Close Friends", "prompts for people with real history together"],
                ["Dating", "for early-stage, getting-to-know-you depth"],
                ["All", "mixes questions from all three contexts"],
              ].map(([filter, desc]) => (
                <li key={filter} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                  <span><span className="text-foreground/80 font-medium">{filter}:</span> {desc}</span>
                </li>
              ))}
            </ul>
          </ModeBlock>

          <div className="border-t border-border/40" />

          {/* After Dark */}
          <ModeBlock title="After Dark" tag="After Dark" tagColor="bg-rose-950/15 text-rose-900/60 dark:bg-rose-400/10 dark:text-rose-300">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hidden by default. Go to Settings to unlock After Dark for spicy, adults-only prompts.
              Anyone can skip any card, anytime — no explanation needed.
            </p>
          </ModeBlock>

          <div className="border-t border-border/40" />

          {/* Closing line */}
          <p className="font-serif text-base text-foreground/80 leading-relaxed text-center pt-1">
            Pick a mode, read the card out loud, and let the conversation do the work.
          </p>

        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-4 border-t border-border shrink-0 space-y-3">
          <button
            onClick={onStart}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm tracking-wide hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Start Playing
          </button>
          <button
            onClick={onDismiss}
            className="w-full text-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1"
          >
            Don't show again
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
});

export default GameIntroModal;
