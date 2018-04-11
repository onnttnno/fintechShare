/*const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/cryptocurrency', {useMongoClient: true});

mongoose.connection
  .once('open', () => console.info('Connected to the database'))
  .on('error', err => console.error(err));*/
//mongoose.connect('mongodb://localhost/chart', {useMongoClient: true}).then(
    //() => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */console.info('Connected to the database'); },
    //err => { /** handle initial connection error */ console.error(err);}
//);*/

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/Chart', {useMongoClient: true});

mongoose.connection
  .once('open', () => console.info('Connected to the database'))
  .on('error', err => console.error(err));