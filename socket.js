let io;
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: [process.env.DOMAIN_CLIENT, process.env.DOMAIN_ADMIN],
        credentials: true,
      },
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },
};
