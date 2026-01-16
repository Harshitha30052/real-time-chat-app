const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
require("dotenv").config();


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const SECRET = 'abcdxyz@123'; // change in production
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serves html files in root

// MySQL connection (update creds if needed)
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'Harshi@0987',
//   database: 'hotel_booking'
// });
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});


db.connect(err => {
  if (err) console.error('DB connect error', err);
  else console.log('Connected to MySQL');
});

// register route
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).send('All fields required');

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send('Hashing failed');
    const q = 'INSERT INTO register (name, email, password) VALUES (?, ?, ?)';
    db.execute(q, [username, email, hash], (err) => {
      if (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).send('User or email exists');
        return res.status(500).send('Database error');
      }
      res.send('Registered successfully');
    });
  });
});

// login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const q = 'SELECT password FROM register WHERE name = ?';
  db.execute(q, [username], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!result.length) return res.status(404).json({ message: 'User not found' });
    const hash = result[0].password;
    bcrypt.compare(password, hash, (err, ok) => {
      if (!ok) return res.status(400).json({ message: 'Wrong password' });
      const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    });
  });
});

/* ========== SOCKET.IO ========== */
const usersInRooms = {};

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on('joinRoom', ({ room, username }) => {
    const roomName = room; // already canonicalized client-side ('Public' or 'private_<key>')
    socket.join(roomName);
    socket.username = username;
    socket.room = roomName;

    if (!usersInRooms[roomName]) usersInRooms[roomName] = [];
    if (!usersInRooms[roomName].includes(username)) usersInRooms[roomName].push(username);

    io.to(roomName).emit('notification', `${username} joined`);
    io.to(roomName).emit('updateUsers', usersInRooms[roomName]);

    // load messages
    const q = 'SELECT username, message, timestamp FROM messages WHERE room = ? ORDER BY timestamp ASC';
    db.query(q, [roomName], (err, rows) => {
      if (!err && rows.length) socket.emit('loadOldMessages', rows);
    });
  });

  socket.on('chatMessage', ({ room, username, msg }) => {
    const q = 'INSERT INTO messages (room, username, message) VALUES (?, ?, ?)';
    db.query(q, [room, username, msg], (err) => {
      if (err) console.error('insert msg err', err);
    });
    io.to(room).emit('message', { username, msg, timestamp: new Date() });
  });

  socket.on('typing', ({ room, username }) => {
    // broadcast to others in room
    socket.to(room).emit('showTyping', username);
  });

  socket.on('stopTyping', ({ room, username }) => {
    // optional: clear typing; by front-end timeout it will clear itself
  });

  socket.on('deleteChat', (room) => {
    const q = 'DELETE FROM messages WHERE room = ?';
    db.query(q, [room], (err) => {
      if (err) console.error('delete err', err);
      io.to(room).emit('notification', 'Chat history deleted');
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

/* ========== start server ========== */
const PORT = process.env.PORT|| 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));
