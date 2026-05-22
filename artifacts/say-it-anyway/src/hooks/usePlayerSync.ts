import { useEffect } from "react";
import { usePlayerHeartbeat, useGetPlayers, getGetPlayersQueryKey } from "@workspace/api-client-react";

export function usePlayerSync(roomCode: string, playerId: string | null) {
  const { data: players } = useGetPlayers(roomCode, {
    query: {
      refetchInterval: 5000,
      enabled: !!roomCode,
      queryKey: getGetPlayersQueryKey(roomCode)
    }
  });

  const heartbeat = usePlayerHeartbeat();

  useEffect(() => {
    if (!roomCode || !playerId) return;

    const interval = setInterval(() => {
      heartbeat.mutate({ code: roomCode, playerId });
    }, 30000);

    // Initial beat
    heartbeat.mutate({ code: roomCode, playerId });

    return () => clearInterval(interval);
  }, [roomCode, playerId, heartbeat.mutate]);

  return { players };
}
