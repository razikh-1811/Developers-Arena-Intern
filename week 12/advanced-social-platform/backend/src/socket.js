const socketIO = (server) => {
  const io = require("socket.io")(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-user", (userId) => {
      socket.join(`user-${userId}`);
    });

    socket.on("send-notification", (data) => {
      io.to(`user-${data.to}`).emit("notification", data);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });
};

module.exports = socketIO;
