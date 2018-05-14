const mongoose = require('mongoose');
const chartSchema = new mongoose.Schema({
  Date : Date, 
  Open : Number, 
  Heigh : Number, 
  Low : Number, 
  Close : Number, 
  Volume : Number
});
chartSchema.set('collection','DTAC');

module.exports = chartSchema;
