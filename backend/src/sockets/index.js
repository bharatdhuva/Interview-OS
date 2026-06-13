const { ChatMessage } = require("../models/chatMessage.model");
const { InterviewRoom } = require("../models/room.model");
const { ReplayFrame } = require("../models/replayFrame.model");
const { Violation } = require("../models/violation.model");
const logger = require("../utils/logger").default;
const mongoose = require("mongoose");

const socketRoomMap = new Map();
const roomUsersMap = new Map();

function getOrCreateRoomUsers(roomId) {
  if (!roomUsersMap.has(roomId)) {
    roomUsersMap.set(roomId, new Map());
  }
  return roomUsersMap.get(roomId);
}

function getRoomUsers(roomId) {
  const users = roomUsersMap.get(roomId);
  if (!users) return [];
  return Array.from(users.values());
}

function broadcastUserList(io, roomId) {
  io.to(roomId).emit("room:user-list", {
    roomId,
    users: getRoomUsers(roomId),
  });
}

async function resolveRoomObjectId(roomId) {
  const roomDoc = await InterviewRoom.findOne({ roomId }).select("_id").lean();
  if (roomDoc?._id) {
    return roomDoc._id;
  }
  return null;
}

function getSocketIdByUserId(roomId, userId) {
  const users = getOrCreateRoomUsers(roomId);
  const user = Array.from(users.values()).find((entry) => entry.userId === userId);
  return user ? user.socketId : null;
}

function getSocketsByRole(roomId, role) {
  const users = getOrCreateRoomUsers(roomId);
  return Array.from(users.values())
    .filter((entry) => entry.role === role)
    .map((entry) => entry.socketId);
}

function normalizeTimestamp(value) {
  if (typeof value === "number") return value;
  if (!value) return Date.now();
  const converted = Number(value);
  return Number.isFinite(converted) ? converted : Date.now();
}

function initSocket(io) {
  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("room:join", async ({ roomId, userId, role, userName, micOn, camOn }) => {
      if (!roomId || !userId) return;
      socket.join(roomId);
      socketRoomMap.set(socket.id, { roomId, userId });

      const users = getOrCreateRoomUsers(roomId);
      users.set(socket.id, {
        socketId: socket.id,
        userId,
        role,
        userName,
        micOn: micOn !== false,
        camOn: camOn !== false,
      });

      socket.to(roomId).emit("room:user-joined", { roomId, userId, role, userName, micOn, camOn });
      broadcastUserList(io, roomId);

      // Fetch and send chat history to the newly joined user
      try {
        const roomObjectId = await resolveRoomObjectId(roomId);
        if (roomObjectId) {
          const history = await ChatMessage.find({ room: roomObjectId, isDeleted: { $ne: true } })
            .populate("sender", "name")
            .sort({ timestamp: 1 })
            .lean();

          if (history && history.length > 0) {
            socket.emit("chat:history", history.map(msg => ({
              roomId,
              message: msg.message,
              userId: msg.sender?._id || msg.sender,
              userName: msg.sender?.name || "Participant",
              timestamp: msg.timestamp,
              chatId: msg._id,
            })));
          }
        }
      } catch (error) {
        logger.error("Failed to load chat history on join", error);
      }
    });

    socket.on("room:leave", ({ roomId, userId }) => {
      if (!roomId) return;
      socket.leave(roomId);
      socketRoomMap.delete(socket.id);

      const users = getOrCreateRoomUsers(roomId);
      users.delete(socket.id);
      if (users.size === 0) {
        roomUsersMap.delete(roomId);
      }

      socket.to(roomId).emit("room:user-left", { roomId, userId });
      broadcastUserList(io, roomId);
    });

    socket.on("code:change", ({ roomId, delta, userId, language }) => {
      if (!roomId) return;
      socket.to(roomId).emit("code:change", { roomId, delta, userId, language });
    });

    socket.on("code:language-change", ({ roomId, language }) => {
      if (!roomId) return;
      socket.to(roomId).emit("code:language-change", { roomId, language });
    });

    socket.on("code:cursor", ({ roomId, userId, position, color }) => {
      if (!roomId || !userId) return;
      socket.to(roomId).emit("code:cursor", { roomId, userId, position, color });
    });

    socket.on("code:snapshot", async ({ roomId, code, language, timestamp }) => {
      if (!roomId) return;
      try {
        await ReplayFrame.create({
          roomId,
          type: "code",
          timestamp: normalizeTimestamp(timestamp),
          payload: { code, language },
        });
      } catch (error) {
        logger.error("Failed to save code snapshot", error);
      }
      socket.to(roomId).emit("code:snapshot", { roomId, code, language, timestamp });
    });

    socket.on("whiteboard:update", ({ roomId, elements, appState }) => {
      if (!roomId) return;
      socket.to(roomId).emit("whiteboard:update", { roomId, elements, appState });
    });

    socket.on("whiteboard:get-state", async ({ roomId }) => {
      if (!roomId) return;
      try {
        const latestFrame = await ReplayFrame.findOne({ roomId, type: "whiteboard" })
          .sort({ timestamp: -1 })
          .lean();
        if (latestFrame && latestFrame.payload) {
          socket.emit("whiteboard:init", {
            elements: latestFrame.payload.elements,
            appState: latestFrame.payload.appState || null,
          });
        }
      } catch (error) {
        logger.error("Failed to fetch whiteboard state", error);
      }
    });

    socket.on("whiteboard:snapshot", async ({ roomId, elements, timestamp }) => {
      if (!roomId) return;
      try {
        await ReplayFrame.create({
          roomId,
          type: "whiteboard",
          timestamp: normalizeTimestamp(timestamp),
          payload: { elements },
        });
      } catch (error) {
        logger.error("Failed to save whiteboard snapshot", error);
      }
      socket.to(roomId).emit("whiteboard:snapshot", { roomId, elements, timestamp });
    });

    socket.on("chat:message", async ({ roomId, message, userId, userName, timestamp }) => {
      if (!roomId || !message || !userId) return;

      let persisted = null;
      try {
        const roomObjectId = await resolveRoomObjectId(roomId);
        if (roomObjectId) {
          let cleanUserId = String(userId).split(":")[0];
          if (!mongoose.Types.ObjectId.isValid(cleanUserId)) {
            // Fallback: resolve to candidate or interviewer of the room
            const roomDoc = await InterviewRoom.findOne({ roomId }).lean();
            if (roomDoc) {
              const users = getOrCreateRoomUsers(roomId);
              const userEntry = users.get(socket.id);
              if (userEntry?.role === "interviewer") {
                cleanUserId = roomDoc.interviewer;
              } else {
                cleanUserId = roomDoc.candidate;
              }
            }
          }

          if (mongoose.Types.ObjectId.isValid(cleanUserId)) {
            persisted = await ChatMessage.create({
              room: roomObjectId,
              sender: cleanUserId,
              message,
              messageType: "text",
              timestamp: timestamp ? new Date(timestamp) : new Date(),
            });
          }
        }
      } catch (error) {
        logger.error("Failed to save chat message", error);
      }

      io.to(roomId).emit("chat:message", {
        roomId,
        message,
        userId,
        userName,
        timestamp,
        chatId: persisted ? persisted._id : undefined,
      });
    });

    socket.on("webrtc:offer", ({ roomId, offer, fromUserId, toUserId }) => {
      if (!roomId || !toUserId) return;
      const targetSocketId = getSocketIdByUserId(roomId, toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc:offer", { roomId, offer, fromUserId, toUserId });
      }
    });

    socket.on("webrtc:answer", ({ roomId, answer, fromUserId, toUserId }) => {
      if (!roomId || !toUserId) return;
      const targetSocketId = getSocketIdByUserId(roomId, toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc:answer", { roomId, answer, fromUserId, toUserId });
      }
    });

    socket.on("webrtc:ice-candidate", ({ roomId, candidate, fromUserId, toUserId }) => {
      if (!roomId || !toUserId) return;
      const targetSocketId = getSocketIdByUserId(roomId, toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc:ice-candidate", {
          roomId,
          candidate,
          fromUserId,
          toUserId,
        });
      }
    });

    socket.on("webrtc:user-ready", ({ roomId, userId }) => {
      if (!roomId || !userId) return;
      socket.to(roomId).emit("webrtc:user-ready", { roomId, userId });
    });

    socket.on("webrtc:call-end", ({ roomId, fromUserId }) => {
      if (!roomId) return;
      io.to(roomId).emit("webrtc:call-end", { roomId, fromUserId });
    });

    socket.on("room:media-toggle", ({ roomId, userId, micOn, camOn }) => {
      if (!roomId) return;
      const users = getOrCreateRoomUsers(roomId);
      const userEntry = users.get(socket.id);
      if (userEntry) {
        if (micOn !== undefined) userEntry.micOn = micOn;
        if (camOn !== undefined) userEntry.camOn = camOn;
      }
      socket.to(roomId).emit("room:media-toggle", { userId, micOn, camOn });
      broadcastUserList(io, roomId);
    });

    socket.on("room:control", ({ roomId, action, targetUserId, value }) => {
      if (!roomId) return;
      io.to(roomId).emit("room:control", { action, targetUserId, value });
    });

    socket.on("proctor:violation", async ({ roomId, userId, type, timestamp, strikeCount }) => {
      if (!roomId || !userId || !type) return;

      try {
        await Violation.create({
          roomId,
          userId,
          type,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          strikeCount,
        });
      } catch (error) {
        logger.error("Failed to save proctoring violation", error);
      }

      const interviewerSocketIds = getSocketsByRole(roomId, "interviewer");
      interviewerSocketIds.forEach((socketId) => {
        io.to(socketId).emit("proctor:violation", {
          roomId,
          userId,
          type,
          timestamp,
          strikeCount,
        });
      });
    });

    socket.on("proctor:warning", ({ roomId, strike, message }) => {
      if (!roomId) return;
      const candidateSocketIds = getSocketsByRole(roomId, "candidate");
      candidateSocketIds.forEach((socketId) => {
        io.to(socketId).emit("proctor:warning", { roomId, strike, message });
      });
    });

    socket.on("proctor:auto-end", ({ roomId, reason }) => {
      if (!roomId) return;
      io.to(roomId).emit("proctor:auto-end", {
        roomId,
        reason: reason || "Session ended after third proctoring strike",
      });
    });

    socket.on("disconnect", () => {
      const roomInfo = socketRoomMap.get(socket.id);
      if (!roomInfo) return;

      const { roomId, userId } = roomInfo;
      socketRoomMap.delete(socket.id);

      const users = getOrCreateRoomUsers(roomId);
      users.delete(socket.id);
      if (users.size === 0) {
        roomUsersMap.delete(roomId);
      }

      socket.to(roomId).emit("room:user-left", { roomId, userId });
      broadcastUserList(io, roomId);
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initSocket };
