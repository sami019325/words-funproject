const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    author: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    meaning: {
        type: String,
        required: true,
    },
    links: [{
        url: String,
        type: {
            type: String,
            enum: ['social', 'external'],
            default: 'external'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Word', wordSchema);
