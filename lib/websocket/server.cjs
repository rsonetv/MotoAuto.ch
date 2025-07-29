const { Server } = require('socket.io');

function initializeWebSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle auction updates
    socket.on('join-auction', (auctionId) => {
      socket.join(`auction-${auctionId}`);
      console.log(`Client ${socket.id} joined auction ${auctionId}`);
    });

    socket.on('leave-auction', (auctionId) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`Client ${socket.id} left auction ${auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = { initializeWebSocketServer };
