const mongoose = require('mongoose');

const LeaderboardEntrySchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true, auto: true},
    board_id: { type: String, required: true },
    name: { type: String, required: true },
    score: { type: Number, required: true },
    created: { type: Date, default: new Date() },
    updated: { type: Date, default: new Date() }
}, {versionKey: false});

//const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

module.exports = LeaderboardEntrySchema;