import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a specific room
  socket.on("join_room", async (data: { roomId: string; userId: string }) => {
    try {
      const { roomId, userId } = data;
      socket.join(roomId);

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });

      if (user) {
        // Update user status to ONLINE
        await prisma.user.update({
          where: { id: userId },
          data: { status: "ONLINE", lastSeen: new Date() },
        });

        // Notify room members
        socket.to(roomId).emit("user_joined", {
          username: user.username,
        });

        console.log(`${user.username} joined room ${roomId}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  // Get messages for a specific room
  socket.on("get_room_messages", async (roomId: string) => {
    try {
      const messages = await prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
        take: 100,
      });
      socket.emit("room_messages", messages);
    } catch (error) {
      console.error("Error fetching room messages:", error);
    }
  });

  // Send message to a specific room
  socket.on(
    "send_room_message",
    async (data: {
      roomId: string;
      userId: string;
      username: string;
      content: string;
    }) => {
      try {
        const { roomId, userId, content } = data;

        // Verify user is a member of the room
        const membership = await prisma.roomMember.findUnique({
          where: {
            userId_roomId: {
              userId,
              roomId,
            },
          },
        });

        if (!membership) {
          socket.emit("error", { message: "Not a member of this room" });
          return;
        }

        // Create message
        const newMessage = await prisma.message.create({
          data: {
            content,
            userId,
            roomId,
            type: "TEXT",
          },
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        });

        // Update room's updatedAt
        await prisma.room.update({
          where: { id: roomId },
          data: { updatedAt: new Date() },
        });

        // Broadcast to all users in the room
        io.to(roomId).emit("new_message", newMessage);
      } catch (error) {
        console.error("Error sending room message:", error);
      }
    },
  );

  // Leave room
  socket.on("leave_room", async (data: { roomId: string; userId: string }) => {
    try {
      const { roomId, userId } = data;
      socket.leave(roomId);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });

      if (user) {
        socket.to(roomId).emit("user_left", {
          username: user.username,
        });
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  // Typing indicator
  socket.on(
    "typing",
    (data: { roomId: string; userId: string; username: string }) => {
      socket.to(data.roomId).emit("user_typing", {
        userId: data.userId,
        username: data.username,
      });
    },
  );

  socket.on("stop_typing", (data: { roomId: string; userId: string }) => {
    socket.to(data.roomId).emit("user_stopped_typing", {
      userId: data.userId,
    });
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
});
