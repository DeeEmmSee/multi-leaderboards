const mongoose = require('mongoose');

const leaderboardSchema = mongoose.Schema({
    //_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    identifier: { type: String, required: true },
    type: { type: String, required: true },
    expiry: { type: Date, default: null },
    created: { type: Date, default: new Date() }
});

const Leaderboard = mongoose.model('Leaderboards', leaderboardSchema);

module.exports = Leaderboard;