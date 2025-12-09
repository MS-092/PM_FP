const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Score = require('./models/Score')
const User = require('./models/User')

// Register
router.post('/register', async(req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const hash = await bcrypt.hash(password, 8);
    try{
        const user = await User.create({
            username,
            email,
            password: hash
        })
        return res.status(200).json(user);  
    }catch(err){
        if (err.code == 11000){
            return res.status(400).json({error: 'Username or Email already exists'})
        }else return res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try{
        const user = await User.findOne({email})
        if (!user){
            return res.status(404).json({ error: 'User not found' });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({error: 'Invalid password'});

        return res.status(200).json(user);
    }catch(err){
        return res.status(500).json({error: err.message});
    }
});

// Save Score
router.post('/score', async(req, res) => {
    const { userId, category, score } = req.body;

    try{
        const new_score = await Score.create({
            user_id: userId,
            category,
            score
        })
        return res.status(200).json({success: true, _id: new_score._id})
    }catch(err){
        return res.status(500).json({error: err.message});
    }
});

// Get Scores (Leaderboard or History)
router.get('/scores/:userId', async(req, res) => {
    const { userId } = req.params;

    try{
        const scores = await Score.find({
            user_id: userId
        })
        return res.status(200).json(scores);
    }catch(err){
        return res.status(500).json({error: err.message});
    }
});

module.exports = router;
