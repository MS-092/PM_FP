const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Score = require('./models/Score')
const User = require('./models/User')
const jwt = require('jsonwebtoken')

const validateToken = async(req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader.split(" ")[1]

    if (!token){
        return res.status(401).json({ message: "Access Denied: Authorization header required (Bearer token)" });
    }
    try{
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return next()
    }catch(err){
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        else return res.status(500).json({message: err.message});
    }
}

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

        const accessToken = generateAccessToken({_id: user._id, username: user.username, email: user.email});
        const refreshToken = generateRefreshToken({_id: user._id, username: user.username, email: user.email});
        res.cookie("refreshToken", refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })

        return res.status(200).json({_id: user._id, username: user.username, email: user.email, accessToken: accessToken});  
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

        const accessToken = generateAccessToken({_id: user._id, username: user.username, email: user.email});
        const refreshToken = generateRefreshToken({_id: user._id, username: user.username, email: user.email});
        res.cookie("refreshToken", refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })

        return res.status(200).json({_id: user._id, username: user.username, email: user.email, accessToken: accessToken});
    }catch(err){
        return res.status(500).json({error: err.message});
    }
});

// Save Score
router.post('/score', validateToken, async(req, res) => {
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
router.get('/scores/:userId', validateToken, async(req, res) => {
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

router.post('/refreshToken', async(req, res) => {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken){
        return res.status(401).json({message: "Refresh token required"})
    }
    try{
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const newPayload = {_id: payload._id, username: payload.username, email: payload.email}
        const newAccessToken = generateAccessToken(newPayload);
        const newRefreshToken = generateRefreshToken(newPayload);

        res.cookie("refreshToken", newRefreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        return res.status(200).json(newAccessToken);
    }catch(err){
        return res.status(500).json({message: "Invalid refresh token"});
    }
})

router.post("/logout", async(req, res) => {
    try{
        res.clearCookie("refreshToken");
        return res.status(200).json({message: "Logged out successfully!"})
    }catch(err){
        return res.status(500).json({message: err.message});
    }
})

const generateAccessToken = (payload) => {
    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})
    return newAccessToken
}

const generateRefreshToken = (payload) => {
    const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"})
    return newRefreshToken
}

module.exports = router;