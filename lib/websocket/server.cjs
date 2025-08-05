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

    let simulationInterval;

    // Handle auction updates
    socket.on('join_auction', (auctionId) => {
      socket.join(auctionId);
      console.log(`Client ${socket.id} joined auction ${auctionId}`);

      // Start sending mock data for this auction
      simulationInterval = setInterval(() => {
        // Simulate a new bid
        const newBid = {
          amount: Math.floor(Math.random() * 10000) + 5000,
          bidder: `User${Math.floor(Math.random() * 100)}`,
          timestamp: new Date().toISOString(),
        };
        io.to(auctionId).emit('new_bid', { auctionId, bid: newBid });

        // Simulate time update
        const timeLeft = `${Math.floor(Math.random() * 60)}m ${Math.floor(Math.random() * 60)}s`;
        io.to(auctionId).emit('time_update', { auctionId, timeLeft });

      }, 5000); // every 5 seconds
    });

    socket.on('leave-auction', (auctionId) => {
      socket.leave(auctionId);
      console.log(`Client ${socket.id} left auction ${auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      clearInterval(simulationInterval);
    });
  });

  return io;
}

module.exports = { initializeWebSocketServer };
