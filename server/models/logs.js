const mongoose = require('mongoose');

const logSchema = mongoose.Schema({
    board_id: { type: String, required: true },
    info: { type: String, required: true },
    created: { type: Date, default: new Date() }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;