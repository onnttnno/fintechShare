const mongoose = require('mongoose');
const chartSchema = new mongoose.Schema({
  NameTicker : String,
  StartDate : Date, 
  EndDate : Date,
  DataImage : String,
  Ticket:String
});
chartSchema.set('collection','PTTsave');

module.exports = chartSchema;
