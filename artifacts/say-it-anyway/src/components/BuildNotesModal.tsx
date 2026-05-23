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
  special?: boolean;
}

const RELEASES: Release[] = [
  {
    version: "v0.1",
    title: "Core Prototype",
    items: [
      "Built the first working version of a digital prompt-card conversation game.",
      "Created the initial game screen with a large centered prompt card.",
      "Added basic card navigation: next, previous, shuffle, skip, and reset.",
      "Established the core interaction model: read the card out loud, answer, and continue the conversation.",
      "Used local state for the first playable version to keep the prototype fast and simple.",
    ],
  },
  {
    version: "v0.2",
    title: "Game Structure and Modes",
    items: [
      "Defined the main product architecture around multiple conversation contexts instead of one generic deck.",
      "Added Classic mode for general conversation.",
      "Added three Classic levels: Read the Room (light, playful), Beneath the Surface (personal, values-focused), and Say It Anyway (honest, vulnerable).",
      "Added The Long Game for couples, close friends, and people who already know each other — with filters for All, Couples, Close Friends, and Dating.",
      "Added After Dark as a hidden adults-only mode with intentional unlock behavior.",
    ],
  },
  {
    version: "v0.3",
    title: "Structured Card Library",
    items: [
      "Replaced temporary sample prompts with a structured card library.",
      "Added a card data model with: id, mode, level, level name, prompt, tags, intensity, relationship context, and hidden/adult flags.",
      "Kept the card library local for speed and simplicity — no database storage for card content.",
      "Added filtering logic by mode, level, and relationship context.",
    ],
  },
  {
    version: "v0.4",
    title: "Content System Expansion",
    items: [
      "Expanded the game to support a full multi-deck content system.",
      "Added Classic content across all three levels.",
      "Added The Long Game content for relationship-specific play.",
      "Added After Dark content for spicy, adults-only prompts.",
      "Preserved hidden/adult metadata so sensitive modes remain gated in the UI.",
      "Added developer-facing card counts and deck visibility checks.",
    ],
  },
  {
    version: "v0.5",
    title: "Visual Identity and Design Language",
    items: [
      "Developed a premium, warm, editorial design direction.",
      "Added distinct visual treatments: Classic (warm, minimal), The Long Game (reflective, mature), After Dark (darker, more intimate).",
      "Refined typography, spacing, card styling, rounded corners, shadows, and interaction states.",
      "Added tasteful transitions and motion while keeping the experience focused on the card.",
    ],
  },
  {
    version: "v0.6",
    title: "Mobile-First UX",
    items: [
      "Refined the experience for phone-sized screens.",
      "Improved tap targets, spacing, and layout hierarchy on mobile.",
      "Made the card the dominant visual element during gameplay.",
      "Adjusted controls for better one-handed use while reading out loud.",
      "Ensured the app works across mobile, tablet, and desktop layouts.",
    ],
  },
  {
    version: "v0.7",
    title: "Creator Footer and Project Framing",
    items: [
      "Added creator attribution: © Uddhav Gupta 2026.",
      "Added external links: website, LinkedIn, and GitHub.",
      "Added project framing: personal project under testing, not for commercialization or public distribution without prior permission.",
      "Added Build Notes as a way to document the product iteration.",
    ],
  },
  {
    version: "v0.8",
    title: "Icon and PWA Polish",
    items: [
      "Added favicon support for desktop browser tabs.",
      "Added iOS home-screen icon support for saving the app from Safari.",
      "Added web app metadata for a more polished app-like experience.",
      "Updated icon direction toward a distinctive prompt-card identity.",
    ],
  },
  {
    version: "v0.9",
    title: "Clearer Entry Flow",
    items: [
      "Updated the home screen to make the primary path clearer.",
      "Added an explicit \"Play on this device\" option for people using one phone, tablet, or laptop.",
      "Clarified that players can read questions out loud and pass the device around.",
      "Moved room-code functionality into a secondary \"Multiplayer in the same room\" section.",
      "Preserved the existing room-code flow while reducing confusion around whether one is required.",
    ],
  },
  {
    version: "v0.10",
    title: "Game Intro and Help System",
    items: [
      "Added a brief onboarding modal when a user first enters the game.",
      "Explained all game modes — Classic, The Long Game, and After Dark — with level and filter context.",
      "Added a local \"do not show again\" flag so onboarding does not repeat.",
      "Added a way to reopen the intro from Settings.",
      "Improved the Settings Help card with clearer instructions and tips.",
    ],
  },
  {
    version: "v0.11",
    title: "Performance and Stability Pass",
    items: [
      "Optimized local card loading and filtering to avoid unnecessary runtime parsing.",
      "Reduced unnecessary rerenders using memoized components and stable callbacks.",
      "Improved mobile performance and interaction smoothness.",
      "Kept the app lightweight by avoiding unnecessary backend complexity.",
    ],
  },
  {
    version: "v0.12",
    title: "Build Notes Refresh",
    items: [
      "Expanded Build Notes into a more complete product changelog.",
      "Made Build Notes more visible in the footer with a version label.",
      "Separated completed work from planned future work.",
      "Improved the Build Notes modal for readability and product clarity.",
    ],
  },
  {
    version: "v0.13",
    title: "Visual Design and Aesthetic Upgrade",
    items: [
      "Clarified the design north star: a premium digital conversation-card deck, not a generic web utility.",
      "Made the prompt card feel more like the hero object of the product — added a stacked-card effect (two decorative cards behind the active card), a faint oversized quotation mark watermark inside the card, and a refined mode/level badge.",
      "Refined mode-specific themes: Classic is warmer and lighter; The Long Game is deeper, more mature, and more reflective; After Dark is darker and richer while staying tasteful.",
      "Added subtle atmospheric radial gradients to the page background that shift tone per mode — amber for Classic, cool parchment for The Long Game, dark cherry for After Dark.",
      "Improved the home screen with a small decorative card-stack above the title, reinforcing the prompt-card visual identity.",
      "Added small tasteful icons to mode selectors — Sparkles for Classic, Compass for The Long Game, Moon for After Dark.",
      "Refined level selector so full names (Read the Room, Beneath the Surface, Say It Anyway) are shown at all screen sizes instead of abbreviated labels.",
      "Quieted tag pills and secondary metadata so the prompt text remains the dominant focus.",
      "Added subtle press/active scale states to navigation controls.",
      "Kept all design changes lightweight: no backdrop-filter, no heavy blur, no layout-shifting animations.",
    ],
  },
];

const ARCHITECTURE = [
  "Frontend-first web app — no server required for gameplay.",
  "Card library stored locally in the project (not in a database).",
  "No user accounts required.",
  "No payment flow.",
  "No answer recording — responses stay entirely between players.",
  "Modes and filters are handled client-side.",
  "After Dark is hidden in the UI until unlocked via Settings.",
  "Room-code multiplayer uses lightweight server state and polling-based sync. Described accurately as experimental in this build.",
];

const NOT_ADDED = [
  "No user accounts.",
  "No social feed.",
  "No AI-generated live prompts.",
  "No payments.",
  "No answer recording — responses stay between players.",
  "No heavy analytics.",
  "No unnecessary database for card content.",
  "No overbuilt multiplayer layer before the core experience was clear.",
];

const PLANNED = [
  "Continue refining card quality based on playtests.",
  "Improve first-card sequencing by mode.",
  "Continue optimizing mobile performance.",
  "Add real multiplayer syncing only if playtesting shows it is necessary.",
];

interface InfoBlockProps {
  title: string;
  items: string[];
  muted?: boolean;
}

function InfoBlock({ title, items, muted }: InfoBlockProps) {
  return (
    <div>
      <p className={cn(
        "text-[11px] font-medium uppercase tracking-widest mb-2",
        muted ? "text-muted-foreground/40" : "text-muted-foreground/60",
      )}>
        {title}
      </p>
      <ul className="space-y-1.5 ml-1">
        {items.map((item, i) => (
          <li key={i} className={cn(
            "flex items-start gap-2 text-xs leading-relaxed",
            muted ? "text-muted-foreground/40" : "text-muted-foreground/60",
          )}>
            <span className={cn(
              "mt-[5px] shrink-0 w-1 h-1 rounded-full",
              muted ? "bg-muted-foreground/20" : "bg-muted-foreground/35",
            )} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const BuildNotesModal = React.memo(function BuildNotesModal({
  open,
  onOpenChange,
}: BuildNotesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[88dvh] flex flex-col overflow-hidden p-0">

        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-2xl font-medium">Build Notes</DialogTitle>
          <p className="text-xs text-muted-foreground/60 leading-relaxed mt-1.5">
            Personal project under active testing. Built iteratively to explore digital
            conversation games, structured content systems, mobile-first UX, and lightweight
            web app deployment.
          </p>
          <p className="text-xs text-muted-foreground/50 leading-relaxed mt-1.5">
            Say It Anyway started as a simple digital prompt-card game and evolved through rapid
            playtesting, UX cleanup, content architecture, and mobile polish. These notes document
            the real build path and what changed over time.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Changelog */}
          {RELEASES.map((release, i) => (
            <div key={release.version}>
              <div className="flex items-baseline gap-3 mb-2.5">
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded tracking-wider bg-primary/8 text-primary">
                  {release.version}
                </span>
                <span className="text-sm font-medium text-foreground">{release.title}</span>
              </div>
              <ul className="space-y-1.5 ml-1">
                {release.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                    <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {i < RELEASES.length - 1 && (
                <div className="mt-5 border-t border-border/40" />
              )}
            </div>
          ))}

          <div className="border-t border-border/60 pt-5 space-y-5">
            <InfoBlock title="Current Architecture" items={ARCHITECTURE} />
          </div>

          <div className="border-t border-border/40 pt-5">
            <InfoBlock title="What I intentionally did not add" items={NOT_ADDED} muted />
          </div>

          <div className="border-t border-border/40 pt-5">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/40 mb-2">
              Planned / Next
            </p>
            <ul className="space-y-1.5 ml-1">
              {PLANNED.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground/40 leading-relaxed">
                  <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-muted-foreground/20" aria-hidden="true" />
                  <span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/30 mr-1">
                      Planned —
                    </span>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-muted-foreground/30 pt-2 pb-1 text-center border-t border-border/30 mt-2">
            Built by Uddhav Gupta as a personal product experiment.
          </p>

        </div>
      </DialogContent>
    </Dialog>
  );
});

export default BuildNotesModal;
