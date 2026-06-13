# Corrected Real-Time Chat App

This folder contains a corrected version of the real-time chat application with:
- JWT-authenticated Socket.IO connections
- fixed package startup path
- MySQL-compatible schema
- token-based client authentication
- improved message history loading

## Setup

1. Copy `.env.example` to `.env` and update the values.
2. Run `npm install`.
3. Create the MySQL database and tables using `database/register.sql` and `database/message.sql`.
4. Start the app with `npm start`.
5. Open `http://localhost:3000` in your browser.

## Folder structure

- `server/` — backend Express + Socket.IO server
- `client/` — login, register, chat UI
- `database/` — corrected MySQL table DDL

## Notes

- `login.html` stores token and username in localStorage.
- `chat.html` passes the JWT token to Socket.IO for authentication.
- The server rejects unauthenticated socket connections.
