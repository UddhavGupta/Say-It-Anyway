import { useState } from "react";
import { useLocation } from "wouter";
import { useJoinRoom, useCreateRoom } from "@workspace/api-client-react";
import { PLAYER_NAME_KEY, PLAYER_ID_KEY, FIXED_ROOM_CODE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

export default function Home() {
  const [localName,   setLocalName]   = useState("");
  const [mpName,      setMpName]      = useState("");
  const [roomCode,    setRoomCode]    = useState("");
  const [mpExpanded,  setMpExpanded]  = useState(false);

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const joinRoom   = useJoinRoom();
  const createRoom = useCreateRoom();

  const isPending = joinRoom.isPending || createRoom.isPending;

  async function startLocal() {
    const name = localName.trim() || "Player";
    localStorage.setItem(PLAYER_NAME_KEY, name);
    try {
      const room = await createRoom.mutateAsync({ data: { createdByPlayerName: name } });
      const playerId = localStorage.getItem(PLAYER_ID_KEY) || undefined;
      const res = await joinRoom.mutateAsync({ code: room.code, data: { displayName: name, playerId } });
      localStorage.setItem(PLAYER_ID_KEY, res.player.id);
      setLocation(`/room/${res.room.code}`);
    } catch {
      toast({ title: "Couldn't start a session. Try again.", variant: "destructive" });
    }
  }

  async function handleCreate() {
    if (!mpName.trim()) {
      toast({ title: "Enter your name first", variant: "destructive" });
      return;
    }
    localStorage.setItem(PLAYER_NAME_KEY, mpName.trim());
    try {
      const room = await createRoom.mutateAsync({ data: { createdByPlayerName: mpName.trim() } });
      const playerId = localStorage.getItem(PLAYER_ID_KEY) || undefined;
      const res = await joinRoom.mutateAsync({ code: room.code, data: { displayName: mpName.trim(), playerId } });
      localStorage.setItem(PLAYER_ID_KEY, res.player.id);
      setLocation(`/room/${res.room.code}`);
    } catch {
      toast({ title: "Couldn't create a room. Try again.", variant: "destructive" });
    }
  }

  async function handleJoin(code: string) {
    if (!mpName.trim()) {
      toast({ title: "Enter your name first", variant: "destructive" });
      return;
    }
    const formatted = code.toUpperCase().trim();
    localStorage.setItem(PLAYER_NAME_KEY, mpName.trim());
    const playerId = localStorage.getItem(PLAYER_ID_KEY) || undefined;
    try {
      const res = await joinRoom.mutateAsync({ code: formatted, data: { displayName: mpName.trim(), playerId } });
      localStorage.setItem(PLAYER_ID_KEY, res.player.id);
      setLocation(`/room/${res.room.code}`);
    } catch {
      toast({ title: "Room not found. Check the code and try again.", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-background">

      {/* ── Hero ── */}
      <div className="text-center mb-5 sm:mb-8">
        <h1 className="text-4xl sm:text-6xl font-serif font-medium tracking-tight text-primary mb-1.5 sm:mb-2">
          Say It Anyway
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">A better way to skip the small talk.</p>
        <p className="hidden sm:block text-sm text-muted-foreground/60 max-w-xs mx-auto leading-relaxed mt-1">
          Play solo, pass the device around, or create a shared room.
        </p>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3 items-start">

        {/* ── PRIMARY: Play on this device ── */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-5 sm:p-7 space-y-4">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-medium">Play on this device</h2>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              One person reads the question out loud. Pass the device around when you want someone else to pick the next card.
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="local-name" className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
              Your name <span className="normal-case font-normal tracking-normal text-muted-foreground/40">(optional)</span>
            </label>
            <input
              id="local-name"
              type="text"
              autoComplete="off"
              placeholder="Leave blank to start as Player"
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") startLocal(); }}
              className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
            />
          </div>

          <button
            onClick={startLocal}
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-base tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {createRoom.isPending ? "Starting…" : "Start Playing"}
          </button>
        </div>

        {/* ── SECONDARY: Multiplayer — collapsible on mobile, always open on desktop ── */}
        <div className={cn(
          "border border-border/40 rounded-2xl transition-colors",
          mpExpanded || "md:!bg-secondary/30",
          "bg-secondary/30",
        )}>
          {/* Toggle header — only acts as toggle on mobile */}
          <button
            className="w-full flex items-center justify-between p-4 sm:p-5 md:cursor-default"
            onClick={() => setMpExpanded(v => !v)}
            aria-expanded={mpExpanded}
            aria-controls="mp-section"
          >
            <div className="text-left">
              <h2 className="font-serif text-base sm:text-lg font-medium text-foreground/80">
                Multiplayer in the same room
              </h2>
              {/* Show description inline when collapsed on mobile */}
              {!mpExpanded && (
                <p className="md:hidden text-[11px] text-muted-foreground/50 mt-0.5">
                  Use a room code to share a session across devices.
                </p>
              )}
            </div>
            {/* Chevron — visible on mobile only */}
            <span
              className={cn(
                "md:hidden ml-3 shrink-0 text-muted-foreground/40 transition-transform duration-200",
                mpExpanded && "rotate-180",
              )}
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>
          </button>

          {/* Expandable body */}
          <div
            id="mp-section"
            className={cn(
              "overflow-hidden transition-all duration-200",
              // Mobile: show/hide based on state
              mpExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
              // Desktop: always visible
              "md:!max-h-none md:!opacity-100",
            )}
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3 pt-1 md:pt-0">
              {/* Description — visible on desktop (hidden on mobile since it's in the header) */}
              <p className="hidden md:block text-xs text-muted-foreground/60 leading-relaxed -mt-1">
                Use a room code when multiple people want to open the same session on their own devices.
              </p>

              <div className="space-y-1">
                <label htmlFor="mp-name" className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
                  Your name
                </label>
                <input
                  id="mp-name"
                  type="text"
                  autoComplete="off"
                  placeholder="How should we call you?"
                  value={mpName}
                  onChange={e => setMpName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && roomCode) handleJoin(roomCode); }}
                  className="w-full h-10 px-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={isPending}
                className="w-full h-10 rounded-xl border border-border bg-background text-foreground/80 text-sm font-medium hover:bg-secondary/60 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {createRoom.isPending ? "Creating…" : "Create a room"}
              </button>

              <div className="relative flex items-center">
                <span className="flex-grow border-t border-border/50" />
                <span className="mx-3 text-[10px] text-muted-foreground/40 uppercase tracking-widest">or join</span>
                <span className="flex-grow border-t border-border/50" />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Room code"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={e => { if (e.key === "Enter" && roomCode) handleJoin(roomCode); }}
                  className="flex-1 h-10 px-4 rounded-xl border border-input bg-background text-sm font-mono tracking-widest placeholder:text-muted-foreground/40 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring/40 transition uppercase"
                />
                <button
                  onClick={() => handleJoin(roomCode)}
                  disabled={!roomCode || isPending}
                  className="h-10 px-5 rounded-xl border border-input bg-background text-sm font-medium hover:bg-secondary/60 active:scale-[0.97] transition-all disabled:opacity-40"
                >
                  {joinRoom.isPending ? "…" : "Join"}
                </button>
              </div>

              <button
                onClick={() => handleJoin(FIXED_ROOM_CODE)}
                disabled={isPending}
                className="w-full text-center text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors py-0.5"
              >
                Join the shared room: {FIXED_ROOM_CODE}
              </button>

              <p className="text-[10px] text-muted-foreground/35 text-center leading-relaxed pt-1 border-t border-border/30">
                Room-code syncing is experimental in this build.
              </p>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
