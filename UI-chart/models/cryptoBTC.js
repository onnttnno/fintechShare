const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
  Date : Number, 
  Open : Number, 
  High : Number, 
  Low : Number, 
  Close : Number, 
  Volume : Number
});
chartSchema.set('collection','crptoBTC');

module.exports = mongoose.model('crptoBTC', chartSchema);
