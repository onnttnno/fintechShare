const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
  Date : String, 
  Open : Number, 
  Heigh : Number, 
  Low : Number, 
  Close : Number, 
  Volume : Number
});
chartSchema.set('collection','testInsert');

module.exports = mongoose.model('testInsert', chartSchema);
