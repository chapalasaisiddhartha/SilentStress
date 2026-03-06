const ChatSession = require('../models/ChatSession');
const MessageLog = require('../models/MessageLog');
const { getPrediction } = require('../services/mlService');

exports.createSession = async (req, res) => {
    try {
        const session = new ChatSession({
            userId: req.user.id
        });
        await session.save();
        res.json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user.id }).sort({ startTime: -1 });
        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ msg: 'Session not found' });
        }

        if (session.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await MessageLog.deleteMany({ sessionId: req.params.id });
        await ChatSession.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Session removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { sessionId, text } = req.body;

        // Ensure session belongs to user
        const session = await ChatSession.findById(sessionId);
        if (!session || session.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Session not found or not authorized' });
        }

        // Call ML service
        const mlResult = await getPrediction(text);

        const message = new MessageLog({
            sessionId,
            userText: text,
            botResponse: mlResult.botResponse,
            stressPrediction: mlResult.prediction,
            confidenceScore: mlResult.stressScore
        });

        await message.save();

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getMessages = async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.sessionId);

        if (!session || session.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Session not found or not authorized' });
        }

        const messages = await MessageLog.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
