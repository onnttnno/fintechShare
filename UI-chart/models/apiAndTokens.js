const mongoose = require('mongoose');
const dataAPISchema = new mongoose.Schema({
    api: String,
    tokens: String
});
dataAPISchema.set('collection','API');

module.exports = dataAPISchema;