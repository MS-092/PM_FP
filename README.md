# EduCross - Educational Crossword App

**EduCross** is a gamified learning platform that generates infinite crossword puzzles to help students master terminology in Science, Math, English, and History. Built with a modern **React** frontend and a robust **Node.js/MongoDB** backend.

## 🚀 Recent Updates

- **Database Migration**: Switched from SQLite to **MongoDB** for better scalability and cloud deployment.
- **Enhanced Security**: Implemented **Access & Refresh Token** authentication.
- **Silent Refresh**: Frontend now automatically handles token expiration via Axios interceptors.
- **Deployment Ready**: Added configurations for seamless deployment on **Vercel**.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Axios, React Router DOM, Vanilla CSS.
- **Backend**: Node.js, Express, Mongoose, CORS, Cookie-parser.
- **Database**: MongoDB (Atlas or Local).
- **Security**: JWT (Access/Refresh Tokens), bcryptjs (Password hashing), HttpOnly Cookies.

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Atlas account or local installation)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/MS-092/PM_FP.git
cd PM_FP
```

### 2. Configure Environment Variables

#### Backend (`server/.env`)
Create a `.env` file in the `server` directory:
```env
MONGODB_URL=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Setup Backend
Install dependencies and start the server:
```bash
cd server
npm install
npm run server
```
The server will run on **http://localhost:3000**.

### 4. Setup Frontend
Install frontend dependencies and start the development server:
```bash
cd client
npm install
npm run dev
```
The application will be available at **http://localhost:5173**.

## 🎮 How to Play

1.  **Register/Login**: Create an account. Your session will be securely managed with rotating tokens.
2.  **Select a Subject**: Choose your difficulty and topic from the Dashboard.
3.  **Solve the Puzzle**:
    - Click a clue in the list OR tap a cell on the grid to highlight the word.
    - Type your answer.
    - Click **SUBMIT** to check.
    - Stuck? Click **HINT** to reveal one letter (-10 points).
4.  **Win**: Complete all words to finish the level!

## 🤝 Contributing

1.  Fork the repository
2.  Create your own amazing feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request