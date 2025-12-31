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

  socket.on("get_messages", async () => {
    try {
      const messages = await prisma.message.findMany({
        orderBy: { createdAt: "asc" },
        include: { user: true },
        take: 50,
      });
      socket.emit("initial_messages", messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      console.log("Received message:", data);

      let user = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (!user) {
        user = await prisma.user.create({
          data: { username: data.username },
        });
      }

      const newMessage = await prisma.message.create({
        data: {
          content: data.content,
          userId: user.id,
        },
        include: { user: true },
      });

      io.emit("receive_message", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
});
