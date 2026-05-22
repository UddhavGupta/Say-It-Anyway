import { useState } from "react";
import { useLocation } from "wouter";
import { useJoinRoom, useCreateRoom } from "@workspace/api-client-react";
import { PLAYER_NAME_KEY, PLAYER_ID_KEY, FIXED_ROOM_CODE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const joinRoom = useJoinRoom();
  const createRoom = useCreateRoom();

  const handleJoin = async (code: string) => {
    if (!name.trim()) {
      toast({ title: "Enter your name first", variant: "destructive" });
      return;
    }
    const formattedCode = code.toUpperCase().trim();
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    const playerId = localStorage.getItem(PLAYER_ID_KEY) || undefined;
    try {
      const res = await joinRoom.mutateAsync({ code: formattedCode, data: { displayName: name.trim(), playerId } });
      localStorage.setItem(PLAYER_ID_KEY, res.player.id);
      setLocation(`/room/${res.room.code}`);
    } catch {
      toast({ title: "Room not found. Check the code and try again.", variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: "Enter your name first", variant: "destructive" });
      return;
    }
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    try {
      const room = await createRoom.mutateAsync({ data: { createdByPlayerName: name.trim() } });
      const playerId = localStorage.getItem(PLAYER_ID_KEY) || undefined;
      const res = await joinRoom.mutateAsync({ code: room.code, data: { displayName: name.trim(), playerId } });
      localStorage.setItem(PLAYER_ID_KEY, res.player.id);
      setLocation(`/room/${res.room.code}`);
    } catch {
      toast({ title: "Couldn't create a room. Try again.", variant: "destructive" });
    }
  };

  const isPending = joinRoom.isPending || createRoom.isPending;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-5 sm:p-8 bg-background relative overflow-hidden">

      {/* Hero copy */}
      <div className="text-center space-y-3 mb-10 z-10">
        <h1 className="text-5xl sm:text-6xl font-serif font-medium tracking-tight text-primary">
          Say It Anyway
        </h1>
        <p className="text-lg text-muted-foreground">A better way to skip the small talk.</p>
        <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
          For dates, friends, couples, and the conversations that usually take three drinks to start.
        </p>
      </div>

      {/* Entry card */}
      <div className="w-full max-w-sm z-10 bg-card border border-border/60 rounded-2xl shadow-sm p-7 space-y-5">

        {/* Name input */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="off"
            placeholder="How should we call you?"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && roomCode) handleJoin(roomCode); }}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
          />
        </div>

        {/* Create room — primary CTA */}
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {createRoom.isPending ? "Creating…" : "Create New Room"}
        </button>

        <p className="text-center text-xs text-muted-foreground/60 leading-relaxed -mt-1">
          Create a room, share the code, and everyone plays from the same deck.
        </p>

        {/* Divider */}
        <div className="relative flex items-center">
          <span className="flex-grow border-t border-border" />
          <span className="mx-4 text-xs text-muted-foreground/50 uppercase tracking-widest">or join</span>
          <span className="flex-grow border-t border-border" />
        </div>

        {/* Join with code */}
        <div className="flex gap-2">
          <input
            id="roomCode"
            type="text"
            autoComplete="off"
            placeholder="Room code"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === "Enter" && roomCode) handleJoin(roomCode); }}
            className="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm font-mono tracking-widest placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring/40 transition uppercase"
          />
          <button
            onClick={() => handleJoin(roomCode)}
            disabled={!roomCode || isPending}
            className="h-11 px-5 rounded-xl border border-input bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 active:scale-[0.97] transition-all disabled:opacity-40"
          >
            {joinRoom.isPending ? "…" : "Join"}
          </button>
        </div>

        {/* SAYIT shared room — subtle */}
        <button
          onClick={() => handleJoin(FIXED_ROOM_CODE)}
          disabled={isPending}
          className="w-full text-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1"
        >
          Join the shared room: {FIXED_ROOM_CODE}
        </button>

      </div>

      {/* Footer */}
      <footer className="mt-10 text-center space-y-1 text-muted-foreground/40 text-xs px-6 max-w-sm z-10">
        <p>Made for better conversations.</p>
        <p>Personal project under testing. Not for commercial use or public distribution without prior permission.</p>
      </footer>
    </div>
  );
}
