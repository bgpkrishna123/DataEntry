const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    score: { type: Number, required: true },
    age: { type: Number, required: true },
    city: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true }
});

const Entry = mongoose.model('Entry', entrySchema);
module.exports = Entry;
