CREATE TABLE messages (
  
  room VARCHAR(255),
  username VARCHAR(255),
  message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
