const mongoose = require('mongoose');
require('./UI-chart/libs/db-connection');
const chartSchema = new mongoose.Schema({
  NameTicker : String,
  StartDate : String, 
  EndDate : String,
  DataImage : String
});
chartSchema.set('collection','PTTsave');

module.exports = mongoose.model('PTTsave', chartSchema);
