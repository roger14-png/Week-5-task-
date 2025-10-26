require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
});

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const Message = require('./models/Message');

// Socket auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: token missing'));
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Authentication error: user not found'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const user = socket.user;
  console.log('user connected', user.email, socket.id);
  socket.join(user._id.toString());
  io.emit('userOnline', { userId: user._id, name: user.name });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sendMessage', async (payload) => {
    try {
      const msg = {
        from: user._id,
        text: payload.text,
        roomId: payload.roomId || null,
        to: payload.to || null,
        createdAt: new Date()
      };
      const saved = await Message.create(msg);
      const out = { ...saved._doc, fromUser: { id: user._id, name: user.name } };

      if (payload.roomId) {
        io.to(payload.roomId).emit('newMessage', out);
      } else if (payload.to) {
        io.to(payload.to).to(user._id.toString()).emit('newMessage', out);
      } else {
        io.emit('newMessage', out);
      }
    } catch (err) {
      console.error('save msg err', err);
    }
  });

  socket.on('typing', (data) => {
    if (data.roomId) socket.to(data.roomId).emit('typing', { userId: user._id, name: user.name });
    else if (data.to) socket.to(data.to).emit('typing', { userId: user._id, name: user.name });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', user.email);
    io.emit('userOffline', { userId: user._id });
  });
});

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> server.listen(process.env.PORT || 5000, ()=> console.log('Server running on port', process.env.PORT || 5000)))
  .catch(err => console.error(err));

// Mount messages route
const messagesRoute = require('./routes/messages');
app.use('/api/messages', messagesRoute);
