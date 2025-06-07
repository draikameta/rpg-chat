const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/history/:chat", (req, res) => {
  const chat = req.params.chat.toLowerCase();
  const filePath = path.join(__dirname, "data", `${chat}.json`);
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(404).json({ error: "Histórico não encontrado" });
    }
    res.json(JSON.parse(data));
  });
});

// Mapeia sockets conectados para identificar usuários e canais
const clients = {};

io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  socket.on("join", (data) => {
    // data = { user: "I.P" ou "P.K", chat: "pk" }
    clients[socket.id] = data;
    socket.join(data.chat);
    console.log(`${data.user} entrou no chat ${data.chat}`);
  });

  socket.on("message", (msg) => {
    // msg = { chat: "pk", sender: "I.P" ou "P.K", message: "texto" }
    console.log(`[${msg.chat}] ${msg.sender}: ${msg.message}`);

    // Envia para todos na sala (inclusive o remetente)
    io.to(msg.chat).emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
    delete clients[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
