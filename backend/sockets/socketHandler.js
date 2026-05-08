const jwt = require('jsonwebtoken');
const { Notification } = require('../models/Others');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    socket.join(socket.userId);

    socket.on('mark_notification_read', async (notifId) => {
      await Notification.findByIdAndUpdate(notifId, { isRead: true, readAt: new Date() });
    });

    socket.on('mark_all_read', async () => {
      await Notification.updateMany({ recipient: socket.userId, isRead: false }, { isRead: true, readAt: new Date() });
    });

    socket.on('join_team', (teamId) => socket.join(`team_${teamId}`));
    socket.on('leave_team', (teamId) => socket.leave(`team_${teamId}`));

    socket.on('team_message', (data) => {
      io.to(`team_${data.teamId}`).emit('team_message', { ...data, timestamp: new Date() });
    });

    socket.on('disconnect', () => console.log(`User disconnected: ${socket.userId}`));
  });
};
