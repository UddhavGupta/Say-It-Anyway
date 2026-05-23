import React, { useState } from "react";
import { Globe, Github } from "lucide-react";
import BuildNotesModal from "@/components/BuildNotesModal";

const VERSION = "v13";

const LINKS = [
  {
    href: "https://guptau.com",
    label: "Visit Uddhav Gupta's website",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    href: "https://www.linkedin.com/in/guptauddhav/",
    label: "Visit Uddhav Gupta on LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://github.com/uddhavgupta",
    label: "Visit Uddhav Gupta on GitHub",
    icon: <Github className="w-4 h-4" />,
  },
] as const;

const Footer = React.memo(function Footer() {
  const [buildNotesOpen, setBuildNotesOpen] = useState(false);

  return (
    <>
      <footer className="w-full mt-auto pt-6 pb-5 px-4 sm:px-8" role="contentinfo">

        {/* ── Desktop layout (sm+): single row ── */}
        <div className="hidden sm:flex max-w-3xl mx-auto items-center justify-between gap-4">

          {/* Left: copyright · version · Build Notes */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50 flex-wrap">
            <span>© Uddhav Gupta 2026</span>
            <span className="text-muted-foreground/25">·</span>
            <span className="font-mono">{VERSION}</span>
            <span className="text-muted-foreground/25">·</span>
            <button
              onClick={() => setBuildNotesOpen(true)}
              aria-label="Open build notes and changelog"
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2 decoration-muted-foreground/25 hover:decoration-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Build Notes
            </button>
          </div>

          {/* Right: social icons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {LINKS.map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-1.5 text-muted-foreground/40 hover:text-muted-foreground/75 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer — desktop, below the row */}
        <p className="hidden sm:block max-w-3xl mx-auto text-[10px] text-muted-foreground/30 leading-relaxed mt-2">
          Personal project under testing. Not for commercialization or public distribution without prior permission.
        </p>

        {/* ── Mobile layout: stacked ── */}
        <div className="flex flex-col items-center gap-2 sm:hidden text-center">

          {/* Line 1: copyright · version */}
          <span className="text-xs text-muted-foreground/50">
            © Uddhav Gupta 2026 <span className="text-muted-foreground/25 mx-1">·</span>
            <span className="font-mono">{VERSION}</span>
          </span>

          {/* Line 2: Build Notes — clearly visible */}
          <button
            onClick={() => setBuildNotesOpen(true)}
            aria-label="Open build notes and changelog"
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2 decoration-muted-foreground/30 hover:decoration-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Build Notes
          </button>

          {/* Line 3: social icons */}
          <div className="flex items-center gap-3">
            {LINKS.map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-1.5 text-muted-foreground/40 hover:text-muted-foreground/75 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Line 4: disclaimer — smallest */}
          <p className="text-[10px] text-muted-foreground/30 leading-relaxed max-w-xs">
            Personal project under testing. Not for commercialization or public distribution without prior permission.
          </p>

        </div>

      </footer>

      <BuildNotesModal open={buildNotesOpen} onOpenChange={setBuildNotesOpen} />
    </>
  );
});

export default Footer;
