import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BuildNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Release {
  version: string;
  title: string;
  items: string[];
  planned?: boolean;
}

const RELEASES: Release[] = [
  {
    version: "v0.1",
    title: "Local Prototype",
    items: [
      "Built the first frontend prototype of a digital prompt-card conversation game.",
      "Created the core room flow with name entry, room code entry, and local session handling.",
      "Added basic card navigation: next, previous, skip, shuffle, and reset.",
    ],
  },
  {
    version: "v0.2",
    title: "Structured Card System",
    items: [
      "Added a structured card data model with IDs, modes, levels, tags, intensity, relationship context, and adult/hidden flags.",
      "Loaded a larger local card library instead of relying on temporary sample prompts.",
      "Added filtering logic for Classic levels and relationship-specific decks.",
    ],
  },
  {
    version: "v0.3",
    title: "Game Modes",
    items: [
      "Added Classic mode with three levels: Read the Room, Beneath the Surface, and Say It Anyway.",
      "Added The Long Game for couples, close friends, and people who already know each other.",
      "Added a hidden After Dark mode with an intentional unlock flow and consent-framed copy.",
    ],
  },
  {
    version: "v0.4",
    title: "Responsive Mobile UX",
    items: [
      "Refined the app for mobile, tablet, and desktop use.",
      "Improved thumb-friendly controls, centered card layout, and compact mobile navigation.",
      "Added distinct visual treatments for Classic, The Long Game, and After Dark.",
    ],
  },
  {
    version: "v0.5",
    title: "Visual Identity and PWA Polish",
    items: [
      "Added favicon and mobile home-screen icon support.",
      "Added web app metadata for a more polished saved-to-home-screen experience.",
      "Refined typography, spacing, shadows, rounded corners, and mode-specific themes.",
    ],
  },
  {
    version: "v0.6",
    title: "Creator Footer and Project Framing",
    items: [
      "Added creator attribution, personal links, and project usage disclaimer.",
      "Added website, LinkedIn, and GitHub links.",
      "Clarified that the app is a personal project under testing and not intended for commercialization or public distribution without prior permission.",
    ],
  },
  {
    version: "v0.7",
    title: "Performance Pass",
    items: [
      "Optimized local card loading and filtering.",
      "Reduced unnecessary rerenders using memoized components and stable callbacks.",
      "Improved mobile responsiveness and interaction smoothness.",
      "Added developer-facing stats for card counts and current deck state.",
    ],
  },
  {
    version: "Planned",
    title: "Next",
    planned: true,
    items: [
      "Add optional realtime room syncing so multiple devices can stay on the same card.",
      "Store only lightweight room state in the backend while keeping the card library local.",
      "Add better host controls for resetting rooms, locking After Dark, and managing session flow.",
      "Continue refining card quality based on real playtesting.",
    ],
  },
];

const BuildNotesModal = React.memo(function BuildNotesModal({
  open,
  onOpenChange,
}: BuildNotesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85dvh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-2xl font-medium">Build Notes</DialogTitle>
          <p className="text-xs text-muted-foreground/70 leading-relaxed mt-1.5">
            Personal project under active testing. Built iteratively to explore digital
            conversation games, responsive UX, structured content systems, and lightweight
            web app deployment.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {RELEASES.map((release, i) => (
            <div key={release.version}>
              <div className="flex items-baseline gap-3 mb-2.5">
                <span
                  className={cn(
                    "text-[11px] font-mono font-medium px-2 py-0.5 rounded tracking-wider",
                    release.planned
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/8 text-primary",
                  )}
                >
                  {release.version}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    release.planned ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {release.title}
                </span>
              </div>
              <ul className="space-y-1.5 ml-1">
                {release.items.map((item, j) => (
                  <li
                    key={j}
                    className={cn(
                      "flex items-start gap-2 text-xs leading-relaxed",
                      release.planned ? "text-muted-foreground/60" : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-[5px] shrink-0 w-1 h-1 rounded-full",
                        release.planned ? "bg-muted-foreground/30" : "bg-muted-foreground/50",
                      )}
                      aria-hidden="true"
                    />
                    {release.planned && (
                      <span className="text-muted-foreground/40 shrink-0 text-[10px] font-medium uppercase tracking-wider mt-[3px]">
                        Planned —&nbsp;
                      </span>
                    )}
                    {item}
                  </li>
                ))}
              </ul>
              {i < RELEASES.length - 1 && (
                <div className="mt-5 border-t border-border/40" />
              )}
            </div>
          ))}

          <p className="text-[11px] text-muted-foreground/40 pt-2 pb-1 text-center">
            Built by Uddhav Gupta as a personal product experiment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default BuildNotesModal;
