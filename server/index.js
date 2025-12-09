const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")

dotenv.config()

const app = express();
const PORT = 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Database Connected!"))
    .catch((err) => console.error(err))

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('EduCross API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
