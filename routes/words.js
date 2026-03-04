const express = require('express');
const router = express.Router();
const Word = require('../models/Word');

// Search words
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const words = await Word.find({
            word: { $regex: q, $options: 'i' }
        }).limit(10);

        res.json(words);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get word details
router.get('/:id', async (req, res) => {
    try {
        const word = await Word.findById(req.params.id);
        if (!word) return res.status(404).json({ error: 'Word not found' });
        res.json(word);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Post a new word
router.post('/', async (req, res) => {
    try {
        const { word, author, content, meaning, links } = req.body;

        // Check if word already exists
        const existing = await Word.findOne({ word: word.toLowerCase() });
        if (existing) return res.status(400).json({ error: 'This word already has a post.' });

        const newWord = new Word({
            word: word.toLowerCase(),
            author,
            content,
            meaning,
            links
        });

        await newWord.save();
        res.status(201).json(newWord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
