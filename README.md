# Real-Time Chat Application

A **Node.js and Socket.IO-based real-time chat application** with user authentication (login/register) and MySQL database support. Users can join rooms, send messages, and see live updates of participants.

---

## Features

- User **registration** and **login** with **hashed passwords** (bcrypt)
- JWT-based authentication for secure login
- **Real-time messaging** using Socket.IO
- **Join multiple rooms** (public or private)
- **Typing indicators** when a user is typing
- **Delete chat history** functionality
- Persistent message storage in **MySQL**
- Simple and responsive **HTML/JS frontend**

---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Frontend:** HTML, CSS, JavaScript  
- **Real-time:** Socket.IO  
- **Database:** MySQL  
- **Authentication:** bcrypt + JWT  

---

## Prerequisites

- Node.js (v18, v20, or v22 recommended)  
- MySQL database  
- npm (Node package manager)  

---

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Harshitha30052/real-time-chat-app.git
cd real-time-chat-app
