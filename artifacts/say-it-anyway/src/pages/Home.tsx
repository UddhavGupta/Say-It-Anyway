import { useState } from "react";
import { useLocation } from "wouter";
import { useJoinRoom, useCreateRoom } from "@workspace/api-client-react";
import { PLAYER_NAME_KEY, PLAYER_ID_KEY, FIXED_ROOM_CODE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

export default function Home() {
  const [mpName,   setMpName]   = useState("");
  const [roomCode, setRoomCode] = useState("");

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const joinRoom   = useJoinRoom();
  const createRoom = useCreateRoom();

  const isPending = joinRoom.isPending || createRoom.isPending;

  async function startLocal() {
    const name = "Player";
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
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-4 sm:p-8 bg-background">

      {/* ── Hero ── */}
      <div className="text-center mb-4 sm:mb-7">
        {/* Mini card stack */}
        <div className="relative w-10 h-14 mx-auto mb-3" aria-hidden="true">
          <div className="absolute inset-0 rounded-lg bg-card border border-border/50 shadow-sm"
            style={{ transform: "rotate(-4deg) translateY(3px)", opacity: 0.5 }} />
          <div className="absolute inset-0 rounded-lg bg-card border border-border/50 shadow-sm"
            style={{ transform: "rotate(2.5deg) translateY(1.5px)", opacity: 0.72 }} />
          <div className="absolute inset-0 rounded-lg bg-card border border-border/60 shadow-sm flex items-center justify-center">
            <span className="font-serif text-lg text-foreground/22" style={{ lineHeight: 1 }}>&ldquo;</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-primary mb-1">
          Say It Anyway
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground">A better way to skip the small talk.</p>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3 items-start">

        {/* ── PRIMARY ── */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-4 sm:p-6 space-y-3">
          <div>
            <h2 className="font-serif text-lg font-medium mb-0.5">Play on this device</h2>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              One person reads the question out loud. Pass the device around when you want someone else to pick the next card.
            </p>
          </div>

          <button
            onClick={startLocal}
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {createRoom.isPending ? "Starting…" : "Start Playing"}
          </button>
        </div>

        {/* ── SECONDARY ── */}
        <div className="bg-secondary/30 border border-border/40 rounded-2xl p-4 sm:p-6 space-y-2.5">
          <div>
            <h2 className="font-serif text-base font-medium text-foreground/80 mb-0.5">Multiplayer in the same room</h2>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Use a room code to share a session across devices.
            </p>
          </div>

          <input
            id="mp-name"
            type="text"
            autoComplete="off"
            placeholder="Your name"
            value={mpName}
            onChange={e => setMpName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && roomCode) handleJoin(roomCode); }}
            className="w-full h-9 px-3 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
          />

          <button
            onClick={handleCreate}
            disabled={isPending}
            className="w-full h-9 rounded-xl border border-border bg-background text-foreground/80 text-sm font-medium hover:bg-secondary/60 active:scale-[0.98] transition-all disabled:opacity-50"
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
              className="flex-1 h-9 px-3 rounded-xl border border-input bg-background text-sm font-mono tracking-widest placeholder:text-muted-foreground/40 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring/40 transition uppercase"
            />
            <button
              onClick={() => handleJoin(roomCode)}
              disabled={!roomCode || isPending}
              className={cn(
                "h-9 px-4 rounded-xl border border-input bg-background text-sm font-medium",
                "hover:bg-secondary/60 active:scale-[0.97] transition-all disabled:opacity-40",
              )}
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

      <Footer />
    </div>
  );
}
