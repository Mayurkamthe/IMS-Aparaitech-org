const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Socket
require('./sockets/socketHandler')(io);
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/interns', require('./routes/interns'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = { app, io };
