import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useJoinRoom, useCreateRoom } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLAYER_NAME_KEY, PLAYER_ID_KEY, FIXED_ROOM_CODE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const joinRoom = useJoinRoom();
  const createRoom = useCreateRoom();

  useEffect(() => {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) setName(savedName);
  }, []);

  const handleJoin = async (code: string) => {
    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    
    const formattedCode = code.toUpperCase().trim();
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    const playerId = localStorage.getItem(PLAYER_ID_KEY) || undefined;

    try {
      const res = await joinRoom.mutateAsync({
        code: formattedCode,
        data: {
          displayName: name.trim(),
          playerId
        }
      });
      localStorage.setItem(PLAYER_ID_KEY, res.player.id);
      setLocation(`/room/${res.room.code}`);
    } catch (err) {
      toast({ title: "Failed to join room", variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }

    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    try {
      const room = await createRoom.mutateAsync({
        data: {
          createdByPlayerName: name.trim()
        }
      });
      
      const playerId = localStorage.getItem(PLAYER_ID_KEY) || undefined;
      const res = await joinRoom.mutateAsync({
        code: room.code,
        data: {
          displayName: name.trim(),
          playerId
        }
      });
      localStorage.setItem(PLAYER_ID_KEY, res.player.id);
      setLocation(`/room/${res.room.code}`);
    } catch (err) {
      toast({ title: "Failed to create room", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="w-full max-w-md space-y-12 z-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight text-primary">Say It Anyway</h1>
          <p className="text-lg text-muted-foreground font-sans">A better way to skip the small talk.</p>
        </div>

        <div className="space-y-6 bg-card p-8 rounded-2xl shadow-sm border border-border/50">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-primary/80">Display Name</Label>
            <Input 
              id="name" 
              placeholder="How should we call you?" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomCode" className="text-primary/80">Room Code</Label>
            <div className="flex gap-2">
              <Input 
                id="roomCode" 
                placeholder="Enter room code" 
                value={roomCode} 
                onChange={(e) => setRoomCode(e.target.value)}
                className="h-12 text-lg uppercase bg-background"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && roomCode) handleJoin(roomCode);
                }}
              />
              <Button 
                onClick={() => handleJoin(roomCode)} 
                disabled={!roomCode || joinRoom.isPending}
                className="h-12 px-6"
              >
                Join
              </Button>
            </div>
          </div>

          <div className="relative flex items-center py-2">
            <span className="flex-grow border-t border-border" />
            <span className="flex-shrink-0 px-4 text-muted-foreground text-sm">or</span>
            <span className="flex-grow border-t border-border" />
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base" 
              onClick={handleCreate}
              disabled={createRoom.isPending || joinRoom.isPending}
            >
              Create New Room
            </Button>
            
            <Button 
              variant="secondary" 
              className="w-full h-12 text-base" 
              onClick={() => handleJoin(FIXED_ROOM_CODE)}
              disabled={joinRoom.isPending}
            >
              Join shared room: {FIXED_ROOM_CODE}
            </Button>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-center space-y-1 text-muted-foreground/60 text-xs px-6 max-w-lg">
        <p>Made for better conversations.</p>
        <p>Personal project under testing. Not for commercial use or public distribution without prior permission.</p>
      </footer>
    </div>
  );
}
