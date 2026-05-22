import { Router, type IRouter } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db, roomsTable, playersTable, cardHistoryTable } from "@workspace/db";
import {
  CreateRoomBody,
  GetRoomParams,
  GetRoomResponse,
  UpdateRoomStateParams,
  UpdateRoomStateBody,
  UpdateRoomStateResponse,
  GetPlayersParams,
  GetPlayersResponseItem,
  JoinRoomParams,
  JoinRoomBody,
  JoinRoomResponse,
  PlayerHeartbeatParams,
  PlayerHeartbeatResponse,
  RecordCardHistoryParams,
  RecordCardHistoryBody,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// Helper: generate room code (6 chars, exclude O, 0, I, 1)
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Helper: serialize room to API shape
function serializeRoom(room: typeof roomsTable.$inferSelect) {
  return {
    ...room,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
    activeLevel: room.activeLevel ?? null,
    currentCardId: room.currentCardId ?? null,
    shuffledDeckOrder: room.shuffledDeckOrder ?? [],
  };
}

// Helper: serialize player to API shape
function serializePlayer(player: typeof playersTable.$inferSelect) {
  return {
    ...player,
    joinedAt: player.joinedAt.toISOString(),
    lastSeenAt: player.lastSeenAt.toISOString(),
  };
}

// POST /rooms — create a new room
router.post("/rooms", async (req, res): Promise<void> => {
  const parsed = CreateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { createdByPlayerName, isFixedRoom, code: customCode } = parsed.data;

  // For the fixed SAYIT room, check if it already exists
  let roomCode = customCode ?? generateRoomCode();

  if (isFixedRoom && customCode) {
    const existingRoom = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.code, customCode))
      .limit(1);

    if (existingRoom.length > 0) {
      res.status(201).json(serializeRoom(existingRoom[0]));
      return;
    }
  }

  // Ensure uniqueness for generated codes
  if (!customCode) {
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db
        .select()
        .from(roomsTable)
        .where(eq(roomsTable.code, roomCode))
        .limit(1);
      if (existing.length === 0) break;
      roomCode = generateRoomCode();
      attempts++;
    }
  }

  const [room] = await db
    .insert(roomsTable)
    .values({
      id: randomUUID(),
      code: roomCode,
      isFixedRoom: isFixedRoom ?? false,
      activeMode: "classic",
      activeLevel: 1,
      activeRelationshipFilter: "all",
      currentCardId: null,
      currentCardIndex: 0,
      shuffledDeckOrder: [],
      afterDarkUnlocked: false,
      createdByPlayerName,
    })
    .returning();

  res.status(201).json(serializeRoom(room));
});

// GET /rooms/:code — get room by code
router.get("/rooms/:code", async (req, res): Promise<void> => {
  const params = GetRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [room] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.code, params.data.code.toUpperCase()))
    .limit(1);

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  res.json(GetRoomResponse.parse(serializeRoom(room)));
});

// PATCH /rooms/:code/state — update room state
router.patch("/rooms/:code/state", async (req, res): Promise<void> => {
  const params = UpdateRoomStateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateRoomStateBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.code, params.data.code.toUpperCase()))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const updates: Partial<typeof roomsTable.$inferInsert> = {};
  const b = body.data;

  if (b.activeMode !== undefined) updates.activeMode = b.activeMode;
  if (b.activeLevel !== undefined) updates.activeLevel = b.activeLevel;
  if (b.activeRelationshipFilter !== undefined) updates.activeRelationshipFilter = b.activeRelationshipFilter;
  if (b.currentCardId !== undefined) updates.currentCardId = b.currentCardId;
  if (b.currentCardIndex !== undefined) updates.currentCardIndex = b.currentCardIndex;
  if (b.shuffledDeckOrder !== undefined) updates.shuffledDeckOrder = b.shuffledDeckOrder;
  if (b.afterDarkUnlocked !== undefined) updates.afterDarkUnlocked = b.afterDarkUnlocked;

  const [room] = await db
    .update(roomsTable)
    .set(updates)
    .where(eq(roomsTable.code, params.data.code.toUpperCase()))
    .returning();

  res.json(UpdateRoomStateResponse.parse(serializeRoom(room)));
});

// GET /rooms/:code/players — list active players
router.get("/rooms/:code/players", async (req, res): Promise<void> => {
  const params = GetPlayersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [room] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.code, params.data.code.toUpperCase()))
    .limit(1);

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  // Players seen in the last 3 minutes
  const cutoff = new Date(Date.now() - 3 * 60 * 1000);
  const players = await db
    .select()
    .from(playersTable)
    .where(and(eq(playersTable.roomId, room.id), gt(playersTable.lastSeenAt, cutoff)));

  res.json(players.map((p) => GetPlayersResponseItem.parse(serializePlayer(p))));
});

// POST /rooms/:code/players — join or update presence
router.post("/rooms/:code/players", async (req, res): Promise<void> => {
  const params = JoinRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = JoinRoomBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [room] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.code, params.data.code.toUpperCase()))
    .limit(1);

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  let player: typeof playersTable.$inferSelect;

  if (body.data.playerId) {
    // Upsert: update lastSeenAt and displayName if player exists
    const [existing] = await db
      .select()
      .from(playersTable)
      .where(eq(playersTable.id, body.data.playerId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(playersTable)
        .set({ displayName: body.data.displayName, lastSeenAt: new Date() })
        .where(eq(playersTable.id, body.data.playerId))
        .returning();
      player = updated;
    } else {
      const [created] = await db
        .insert(playersTable)
        .values({ id: body.data.playerId, roomId: room.id, displayName: body.data.displayName })
        .returning();
      player = created;
    }
  } else {
    const [created] = await db
      .insert(playersTable)
      .values({ id: randomUUID(), roomId: room.id, displayName: body.data.displayName })
      .returning();
    player = created;
  }

  res.json(
    JoinRoomResponse.parse({
      room: serializeRoom(room),
      player: serializePlayer(player),
    })
  );
});

// POST /rooms/:code/players/:playerId/heartbeat
router.post("/rooms/:code/players/:playerId/heartbeat", async (req, res): Promise<void> => {
  const raw = req.params;
  const parsed = PlayerHeartbeatParams.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [player] = await db
    .update(playersTable)
    .set({ lastSeenAt: new Date() })
    .where(eq(playersTable.id, parsed.data.playerId))
    .returning();

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  res.json(PlayerHeartbeatResponse.parse(serializePlayer(player)));
});

// POST /rooms/:code/history — record card history
router.post("/rooms/:code/history", async (req, res): Promise<void> => {
  const params = RecordCardHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = RecordCardHistoryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [room] = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.code, params.data.code.toUpperCase()))
    .limit(1);

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const [history] = await db
    .insert(cardHistoryTable)
    .values({
      id: randomUUID(),
      roomId: room.id,
      cardId: body.data.cardId,
      mode: body.data.mode,
      level: body.data.level ?? null,
      advancedByPlayerName: body.data.advancedByPlayerName,
    })
    .returning();

  res.status(201).json({
    id: history.id,
    roomId: history.roomId,
    cardId: history.cardId,
    mode: history.mode,
    level: history.level ?? null,
    shownAt: history.shownAt.toISOString(),
    advancedByPlayerName: history.advancedByPlayerName,
  });
});

export default router;
