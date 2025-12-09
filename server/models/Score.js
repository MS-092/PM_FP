const mongoose = require("mongoose");

const scoreSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const Score = mongoose.model("Score", scoreSchema)
module.exports = Score