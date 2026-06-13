const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const requiredEnvs = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'JWT_SECRET'];
const missingEnvs = requiredEnvs.filter(key => !process.env[key]);
if (missingEnvs.length) {
  console.error('Missing required environment variables:', missingEnvs.join(', '));
  console.error('Create a .env file from .env.example and fill in the database and JWT values.');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client')));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('DB connect error', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'login.html'));
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).send('All fields required');

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send('Hashing failed');
    const q = 'INSERT INTO register (name, email, password) VALUES (?, ?, ?)';
    db.execute(q, [username, email, hash], err => {
      if (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).send('User or email exists');
        return res.status(500).send('Database error');
      }
      res.send('Registered successfully');
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const q = 'SELECT password FROM register WHERE name = ?';
  db.execute(q, [username], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!result.length) return res.status(404).json({ message: 'User not found' });
    const hash = result[0].password;
    bcrypt.compare(password, hash, (err, ok) => {
      if (err || !ok) return res.status(400).json({ message: 'Wrong password' });
      const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    });
  });
});

const usersInRooms = {};

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return next(new Error('Invalid token'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id, socket.user.username);

  socket.on('joinRoom', ({ room }) => {
    const roomName = (room || '').trim();
    if (!roomName) return;

    const username = socket.user.username;
    socket.join(roomName);
    socket.username = username;
    socket.room = roomName;

    if (!usersInRooms[roomName]) usersInRooms[roomName] = [];
    if (!usersInRooms[roomName].includes(username)) usersInRooms[roomName].push(username);

    io.to(roomName).emit('notification', `${username} joined`);
    io.to(roomName).emit('updateUsers', usersInRooms[roomName]);

    const q = 'SELECT username, message, timestamp FROM messages WHERE room = ? ORDER BY timestamp DESC LIMIT 100';
    db.query(q, [roomName], (err, rows) => {
      if (!err) {
        socket.emit('loadOldMessages', rows.reverse());
      }
    });
  });

  socket.on('chatMessage', ({ room, msg }) => {
    const roomName = (room || '').trim();
    const username = socket.user.username;
    if (!roomName || !msg) return;

    const q = 'INSERT INTO messages (room, username, message) VALUES (?, ?, ?)';
    db.query(q, [roomName, username, msg], (err) => {
      if (err) {
        console.error('insert msg err', err);
        socket.emit('serverError', 'Unable to save message');
        return;
      }
      io.to(roomName).emit('message', { username, msg, timestamp: new Date() });
    });
  });

  socket.on('typing', ({ room }) => {
    const roomName = (room || '').trim();
    if (!roomName) return;
    socket.to(roomName).emit('showTyping', socket.user.username);
  });

  socket.on('stopTyping', ({ room }) => {
    const roomName = (room || '').trim();
    if (!roomName) return;
    socket.to(roomName).emit('hideTyping', socket.user.username);
  });

  socket.on('deleteChat', (room) => {
    const roomName = (room || '').trim();
    if (!roomName) return;
    const q = 'DELETE FROM messages WHERE room = ?';
    db.query(q, [roomName], (err) => {
      if (err) {
        console.error('delete err', err);
        socket.emit('serverError', 'Unable to delete chat');
        return;
      }
      io.to(roomName).emit('notification', 'Chat history deleted');
      io.to(roomName).emit('chatDeleted');
    });
  });

  socket.on('disconnect', () => {
    const { room, username } = socket;
    if (room && username && usersInRooms[room]) {
      usersInRooms[room] = usersInRooms[room].filter(x => x !== username);
      io.to(room).emit('updateUsers', usersInRooms[room]);
      io.to(room).emit('notification', `${username} left`);
    }
  });
});

server.listen(PORT, () => console.log('Server listening on', PORT));
