const axios = require('axios');

const getPrediction = async (text) => {
    try {
        const response = await axios.post('http://localhost:5000/predict', { text }, {
            timeout: 5000 // 5 seconds timeout
        });

        return {
            prediction: response.data.prediction,
            confidence: response.data.confidence
        };
    } catch (error) {
        console.error('ML Service Error:', error.message);
        throw new Error('Failed to get prediction from ML service');
    }
};

module.exports = { getPrediction };
