import { useState } from "react";
import { useLocation } from "wouter";
import { useJoinRoom, useCreateRoom } from "@workspace/api-client-react";
import { PLAYER_NAME_KEY, PLAYER_ID_KEY, FIXED_ROOM_CODE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

export default function Home() {
  // Local-play state
  const [localName, setLocalName] = useState("");

  // Multiplayer state
  const [mpName,     setMpName]     = useState("");
  const [roomCode,   setRoomCode]   = useState("");

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const joinRoom   = useJoinRoom();
  const createRoom = useCreateRoom();

  const isPending = joinRoom.isPending || createRoom.isPending;

  // ── Helpers ────────────────────────────────────────────────────────────────

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
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-start sm:justify-center p-5 sm:p-8 bg-background">

      {/* ── Hero ── */}
      <div className="text-center space-y-2.5 mb-8 sm:mb-10 pt-10 sm:pt-0">
        <h1 className="text-5xl sm:text-6xl font-serif font-medium tracking-tight text-primary">
          Say It Anyway
        </h1>
        <p className="text-lg text-muted-foreground">A better way to skip the small talk.</p>
        <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto leading-relaxed">
          Play solo, pass the device around, or create a shared room.
        </p>
      </div>

      {/* ── Two-panel layout ── */}
      {/* Mobile: stacked. Desktop: side-by-side */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

        {/* ── PRIMARY: Play on this device ── */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-7 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-medium">Play on this device</h2>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              One person reads the question out loud. Pass the device around when you want someone else to pick the next card.
            </p>
          </div>

          {/* Optional name — lightweight */}
          <div className="space-y-1.5">
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
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
            />
          </div>

          <button
            onClick={startLocal}
            disabled={isPending}
            className="w-full h-13 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-base tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {createRoom.isPending ? "Starting…" : "Start Playing"}
          </button>
        </div>

        {/* ── SECONDARY: Multiplayer in the same room ── */}
        <div className="bg-secondary/30 border border-border/40 rounded-2xl p-7 space-y-4">
          <div className="space-y-1">
            <h2 className="font-serif text-lg font-medium text-foreground/80">Multiplayer in the same room</h2>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Use a room code when multiple people want to open the same session on their own devices.
            </p>
          </div>

          {/* Name — required for multiplayer */}
          <div className="space-y-1.5">
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

          {/* Create room */}
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="w-full h-10 rounded-xl border border-border bg-background text-foreground/80 text-sm font-medium hover:bg-secondary/60 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {createRoom.isPending ? "Creating…" : "Create a room"}
          </button>

          {/* Divider */}
          <div className="relative flex items-center">
            <span className="flex-grow border-t border-border/50" />
            <span className="mx-3 text-[10px] text-muted-foreground/40 uppercase tracking-widest">or join</span>
            <span className="flex-grow border-t border-border/50" />
          </div>

          {/* Join with code */}
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
              className={cn(
                "h-10 px-5 rounded-xl border border-input bg-background text-sm font-medium",
                "hover:bg-secondary/60 active:scale-[0.97] transition-all disabled:opacity-40",
              )}
            >
              {joinRoom.isPending ? "…" : "Join"}
            </button>
          </div>

          {/* SAYIT shared room */}
          <button
            onClick={() => handleJoin(FIXED_ROOM_CODE)}
            disabled={isPending}
            className="w-full text-center text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors py-0.5"
          >
            Join the shared room: {FIXED_ROOM_CODE}
          </button>

          {/* Experimental note */}
          <p className="text-[10px] text-muted-foreground/35 text-center leading-relaxed pt-1 border-t border-border/30">
            Room-code syncing is experimental in this build.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
