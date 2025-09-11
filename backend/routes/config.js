const express = require('express');
const router = express.Router();

// Expose public configuration needed by frontend
router.get('/api/config/maps-key', (req, res) => {
    const key = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!key || key === 'your_google_maps_api_key') {
        return res.status(200).json({ success: true, key: '' });
    }
    return res.json({ success: true, key });
});

// Expose Gemini API key for chatbot
router.get('/api/config/gemini-key', (req, res) => {
    const key = process.env.GEMINI_API_KEY || '';
    if (!key || key === 'your_gemini_api_key_here') {
        return res.status(200).json({ success: true, key: '' });
    }
    return res.json({ success: true, key });
});

module.exports = router;

