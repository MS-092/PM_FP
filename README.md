# EduCross - Educational Crossword App

**EduCross** is a gamified learning platform that generates infinite crossword puzzles to help students master terminology in Science, Math, English, and History. Built with a modern **React** frontend and a local **Node.js/SQLite** backend.

## 🚀 Features

- **Infinite Replayability**: Procedural generation algorithm ensures a unique 12x12 grid every time you play.
- **Subject Mastery**: 
  - 🔬 **Science Starter**: Biology, Chemistry, Physics terms.
  - 📐 **Math Builder**: Geometry, Algebra, Arithmetic concepts.
  - 📚 **English Master**: Grammar, Poetry, Literature vocab.
  - 🏛️ **History Quest**: Civilizations, Leaders, Eras.
- **Gamified Experience**:
  - ⏱️ **Timer & Scoring**: Earn points for speed and accuracy.
  - 💡 **Smart Hint System**: Reveal single missing letters (-10 points) without spoiling the whole word.
  - 🏆 **Progress Tracking**: Your scores are saved locally to track improvement.
- **Modern UI/UX**:
  - Dark Mode with Neon accents.
  - Fully responsive design (Mobile & Desktop).
  - Interactive Grid and Clue List.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, React Router DOM, Vanilla CSS (Variables & Responsive Grid).
- **Backend**: Node.js, Express, CORS.
- **Database**: SQLite (Local persistence for users and scores).
- **Security**: bcryptjs (Password hashing), .env (Environment config).

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/PM_FP.git
cd PM_FP
```

### 2. Configure Environment
Copy the example environment file and set up your variables:
```bash
cp .env.example .env
```
*Note: Default `VITE_API_URL` is `http://localhost:3000`.*

### 3. Setup Backend
Install dependencies and start the server:
```bash
npm install express cors sqlite3 bcryptjs jsonwebtoken dotenv
node server/index.js
```
The server will run on **http://localhost:3000** and create a local `server/database.sqlite` file.

### 4. Setup Frontend
Open a new terminal, install frontend dependencies, and start the development server:
```bash
npm install
npm run dev
```
The application will be available at **http://localhost:5173**.

## 🎮 How to Play

1.  **Register/Login**: Create an account to save your high scores.
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