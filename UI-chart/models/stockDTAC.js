const mongoose = require('mongoose');
require('./UI-chart/libs/db-connection');
const chartSchema = new mongoose.Schema({
  Date : String, 
  Open : Number, 
  Heigh : Number, 
  Low : Number, 
  Close : Number, 
  Volume : Number
});
chartSchema.set('collection','DTAC');

module.exports = mongoose.model('DTAC', chartSchema);
