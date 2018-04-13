const mongoose = require('mongoose');
require('../libs/db-connection');
const chartSchema = new mongoose.Schema({
  Date : String, 
  Open : Number, 
  Heigh : Number, 
  Low : Number, 
  Close : Number, 
  Volume : Number
});
chartSchema.set('collection','CPALL');

module.exports = mongoose.model('CPALL', chartSchema);
