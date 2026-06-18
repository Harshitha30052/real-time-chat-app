# Real-Time Chat Application

A real-time chat application developed to enable instant communication between users through low-latency messaging and secure authentication.

This project demonstrates full-stack application development using real-time communication technologies, user authentication, persistent storage, and client–server interaction.

---

## Project Overview

The objective of this project was to understand how real-time communication differs from traditional request–response applications and implement a scalable chat system.

The application allows users to register, log in securely, authenticate using JWT, send and receive messages instantly, and maintain chat history.

---

## Features

* User Registration and Login
* JWT-based Authentication
* Real-Time Messaging using Socket.io
* Secure Socket Authentication
* Message History Loading
* Persistent Chat Storage
* Responsive Chat Interface
* Client–Server Communication

---

## Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* Socket.io

### Authentication

* JSON Web Token (JWT)

### Database

* MySQL

---

## Setup Instructions

### 1. Clone Repository

git clone YOUR_REPOSITORY_URL

cd real-time-chat-application

---

### 2. Configure Environment Variables

Copy:

.env.example → .env

Update required values.

---

### 3. Install Dependencies

npm install

---

### 4. Configure Database

Create the database and import:

* database/register.sql
* database/message.sql

---

### 5. Start Application

npm start

---

### 6. Open Browser

http://localhost:3000

---

## Project Structure

* **server/** – Backend APIs and Socket.io communication
* **client/** – Login, registration, and chat interface
* **database/** – MySQL schema and SQL files
* **.env** – Environment configuration

---

## Authentication Flow

The application uses JWT authentication for secure communication.

Process:

* User logs in and receives a JWT token
* Token is stored on the client side
* Client sends the token during Socket.io connection
* Server validates the token before establishing communication
* Unauthorized connections are rejected

---

## Real-Time Communication Workflow

* User sends a message
* Backend receives the event through Socket.io
* Message is stored in the database
* Connected users receive updates instantly
* Chat history is loaded when users reconnect

---

## Challenges Faced

During development, challenges included:

* Managing real-time event synchronization
* Implementing secure socket authentication
* Maintaining persistent message history
* Handling client–server communication
* Managing database integration

---

## Debugging Process

To improve reliability:

* Tested socket events using browser developer tools
* Verified JWT generation and validation
* Checked database persistence and retrieval
* Traced connection and reconnection behavior
* Fixed startup and dependency issues

---

## Future Improvements

* Private chat rooms
* Group messaging
* Media sharing
* Typing indicators
* Read receipts
* Cloud deployment

---

## Learning Outcomes

Through this project, I gained experience in:

* Real-Time Application Development
* Socket.io Communication
* JWT Authentication
* Backend API Development
* Database Integration
* Event-Driven System Debugging

---

## Author

Harshitha Reddy
