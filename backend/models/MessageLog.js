const mongoose = require('mongoose');

const MessageLogSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true
    },
    userText: {
        type: String,
        required: true
    },
    botResponse: {
        type: String,
        required: true
    },
    stressPrediction: {
        type: String,
        required: true
    },
    confidenceScore: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MessageLog', MessageLogSchema);
