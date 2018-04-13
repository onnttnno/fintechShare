const mongoose = require('mongoose');
const chartSchema = new mongoose.Schema({
  NameTicker : String,
  StartDate : String, 
  EndDate : String,
  DataImage : String
});
chartSchema.set('collection','PTTsave');

module.exports = chartSchema;
