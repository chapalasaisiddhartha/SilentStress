const axios = require('axios');

const getPrediction = async (text) => {
    try {
        const response = await axios.post('http://localhost:5002/predict', { text }, {
            timeout: 15000 // 15 seconds timeout
        });

        return {
            prediction: response.data.prediction,
            stressScore: response.data.stressScore,
            botResponse: response.data.botResponse
        };
    } catch (error) {
        console.error('ML Service Error:', error.message);
        throw new Error('Failed to get prediction from ML service');
    }
};

module.exports = { getPrediction };
