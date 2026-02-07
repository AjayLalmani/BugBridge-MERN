# BugBridge - Collaborative Bug Tracking System

BugBridge is a full-stack **Project Management & Bug Tracking Application** built to help software teams streamline their workflow. It features a Trello-style **Kanban Board**, real-time task management, team collaboration tools, and robust role-based security.
---

## 🚀 Features

### 🛡️ **Authentication & Security**
* **Secure Login/Signup:** JWT-based authentication with password hashing (`bcryptjs`).
* **Role-Based Access Control (RBAC):** Custom middleware ensures only **Project Owners** can delete projects or tasks. Team members have restricted permissions.
* **Protected Routes:** unauthorized users cannot access the dashboard or private projects.

### 📊 **Project Management**
* **Dashboard:** View all your projects in one place (Solo & Team projects).
* **Create/Delete Projects:** Manage project lifecycles easily.
* **Team Collaboration:** Invite members to your project via email.

### 📋 **Kanban Board & Tasks**
* **Drag & Drop Interface:** Smooth drag-and-drop functionality using `@hello-pangea/dnd`.
* **Task Columns:** Todo, In Progress, Done.
* **Task Details:**
    * Set **Priority** (High 🔥, Medium 🟡, Low 🟢).
    * **Assign** tasks to specific team members.
    * Add detailed descriptions.

### 💬 **Communication**
* **Comments System:** Integrated chat/comment section within each task for team discussions.
* **Real-time Updates:** See who commented and when.

### 🔍 **Advanced Search & Filtering**
* **Smart Search:** Find tasks by title or description keywords.
* **Filters:** Filter tasks by **Priority** or **Assignee** to focus on what matters.

---

## 🛠️ Tech Stack

### **Frontend**
* **React.js (Vite):** For a fast and interactive UI.
* **Tailwind CSS:** For modern, responsive styling.
* **React Router DOM:** For seamless navigation.
* **Axios:** For API communication.
* **@hello-pangea/dnd:** For Kanban drag-and-drop logic.

### **Backend**
* **Node.js & Express.js:** RESTful API architecture.
* **MongoDB & Mongoose:** NoSQL database for flexible data modeling.
* **JWT & Bcrypt:** For secure authentication.
* **Cors & Dotenv:** For security and configuration.

---

## ⚙️ Installation & Setup

### Prerequisites
Ensure you have the following installed:
* **Node.js** (v14 or higher)
* **npm** (Node Package Manager)
* **MongoDB** (Local instance or MongoDB Atlas account)
* **Git**
# 🛠️ BugBridge Setup Guide

Welcome to the **BugBridge** setup guide! Follow these steps to get the project up and running on your local machine.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v16 or higher recommended) - [Download Here](https://nodejs.org/)
* **npm** (Comes with Node.js)
* **Git** - [Download Here](https://git-scm.com/)
* **MongoDB** - You can use a local instance or a free cloud database via [MongoDB Atlas](https://www.mongodb.com/atlas).

---

## 🚀 Step 1: Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone https://github.com/your-username/bugbridge.git
cd bugbridge
```

---

## ⚙️ Step 2: Backend Setup (Server)

The backend runs on **Port 5000**. We need to install dependencies and set up environment variables.

### 1. Navigate to the Server folder

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a new file named `.env` inside the `server` folder. Open it and paste the following configuration:

```env
PORT=5000
MONGO_URL=mongodb+srv://<your_username>:<your_password>@cluster0.mongodb.net/bugbridge?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key_12345
```

> **Note:** Replace `MONGO_URL` with your actual MongoDB connection string. If using a local database, use `mongodb://localhost:27017/bugbridge`.

### 4. Start the Server

```bash
npm run dev
```

✅ **Success:** You should see: `Server running on port 5000` and `MongoDB Connected`.

---

## 💻 Step 3: Frontend Setup (Client)

Open a **new terminal window** (keep the server terminal running) to set up the React frontend.

### 1. Navigate to the Client folder

From the root `bugbridge` folder:

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the React App

```bash
npm run dev
```

---

## 🌐 Step 4: Access the Application

Once both terminals are running without errors:

1. Open your browser.
2. Go to: **http://localhost:5173** (Vite usually defaults to this port).
3. You should see the **BugBridge Login Screen**.

---

## 🔧 Troubleshooting

### **Error: "Address already in use" (Backend)**

* **Cause:** Port 5000 is being used by another program.
* **Fix:** Change `PORT=5001` in your `.env` file. Then, update `client/src/utils/api.js` to point to port 5001.

### **Error: "Connection Refused" (Frontend)**

* **Cause:** The frontend cannot talk to the backend.
* **Fix:** Ensure the backend server is running. Check `client/src/utils/api.js` and ensure the base URL is `http://localhost:5000/api`.

### **MongoDB Connection Error**

* **Cause:** Incorrect URL or IP restrictions.
* **Fix:**
* If using **MongoDB Atlas**, go to "Network Access" and add your current IP address (or `0.0.0.0/0` for access from anywhere).
* Check your username and password in the `MONGO_URL` (remove `< >` symbols).

