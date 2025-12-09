const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const mongoose = require("mongoose");
const dotenv = require("dotenv")

dotenv.config()

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
