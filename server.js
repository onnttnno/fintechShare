const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jose = require('node-jose');
var https = require('https');
const server = require('http').createServer(app);
const serverHttps=https.createServer(app);
var keystore = jose.JWK.createKeyStore();
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 3000;
//mongo lib
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//require('./UI-chart/libs/db-connection');

/**connection DB********************************************************************************************* */
//chart
const dbChart = mongoose.createConnection('mongodb://localhost/Chart', {useMongoClient: true});
dbChart.on('connected', function(res){console.log('DBchart connected')});
dbChart.on('disconnected', function(err){console.log('DBchart cant connecting: '+err)});

//share
const dbShare = mongoose.createConnection('mongodb://localhost/data', {useMongoClient: true});
dbChart.on('connected', function(res){console.log('DBShare connected')});
dbShare.on('disconnected', function(err){console.log('DBShare cant connecting: '+err)});
/************************************************************************************************************ */
/**Schema ****************************************************************************************************/
// PTT model
const PTT = require('./UI-chart/models/stockPTT');
// CPALL model
const CPALL = require('./UI-chart/models/stockCPALL');


// DTAC model
const DTAC = require('./UI-chart/models/stockDTAC');


// AOT model
const AOT = require('./UI-chart/models/stockAOT');


// KBANK model
const KBANK = require('./UI-chart/models/stockKBANK');

//APi
const API = require('./UI-chart/models/apiAndTokens')

// INSERT model
const SHARE = require('./UI-chart/models/PTTsave');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// INSERT model
/*const insertDT = require('./UI-chart/models/insertData');
require('./UI-chart/libs/db-connection');*/

/**Model--------------------------------------------------------------------------------------------------------------- */
//model of share
const apiModel = dbShare.model('API',API);
const shareModel=dbShare.model('PTTsave',SHARE);
//model of chart
const kbankModel=dbChart.model('KBANK',KBANK);
const aotModel=dbChart.model('AOT',AOT);
const dtacModel=dbChart.model('DTAC',DTAC);
const cpallModel=dbChart.model('CPALL',CPALL);
const pttModel=dbChart.model('PTT',PTT);
/*--------------------------------------------------------------------------------------------------------------------- */
// view engine
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');




//mongo schema
/*const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;*/
/*
const dataSchema = new Schema({
    id: ObjectId,
    data: String,
    image: String
});

var Data = mongoose.model('Data', dataSchema);*/

/*const dataAPI = new Schema({
    api: String,
    tokens: String
});

var API = mongoose.model('API', dataAPI);*/

//init keystore
var props = {
    kid: 'ServerKey',
    alg: 'A256GCM',
    use: 'enc'
};
keystore.generate("oct", 1024, props).
then(function (result) {
    console.log(result);
});
//check connection
app.get('/node/fintechShare/secure', (req, res) => res.send('connection completed!'))

//public key
app.get('/node/fintechShare/secure/getPublicKey', function (req, res) {
    key = keystore.get('ServerKey');
    res.send(key.toJSON());
});

//hand shake
app.get('/node/fintechShare/secure/handShake/:cypher', function (req, res) {

    jose.JWE.createDecrypt(keystore.get('ServerKey')).
    decrypt(req.params.cypher).
    then(function (result) {
        // {result} is a Object with:
        // *  header: the combined 'protected' and 'unprotected' header members
        // *  protected: an array of the member names from the "protected" member
        // *  key: Key used to decrypt
        // *  payload: Buffer of the decrypted content
        // *  plaintext: Buffer of the decrypted content (alternate)
        jose.JWK.asKey(result.pK).
        then(function (r) {
            // {result} is a jose.JWK.Key
            // {result.keystore} is a unique jose.JWK.KeyStore
            keystore.add(r).
            then(function (re) {
                // {result} is a jose.JWK.Key
                //key = result;
                apiModel.find({
                    api: result.api
                }, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    } else {
                        console.log(data);
                        jose.JWE.createEncrypt(keystore.get('ServiceKeys')).
                        update(data).
                        final().
                        then(function (cy) {
                            // {result} is a JSON Object -- JWE using the JSON General Serialization
                            console.info("cypher"+cy);
                            res.send(cy);
                        });
                    }

                });

            });
        });
    });
});

//save
app.post('/save', function (req, res) {
    res.send('save complete');

    jose.createDecrypt(keystore.get('gBdaS-G8RLax2qgObTD94w'))
        .decrypt(req.body)
        .then(function (result) {
            var shareOBJ = new Data({
                id: guid(),
                data: result.data,
                image: result.image
            });

            shareOBJ.save(function (err, r) {
                if (err) {
                    res.send('server save error');

                } else {
                    shareOBJ.save(function (err, shareOBJ) {
                        if (err) return console.error(err);
                        jose.JWE.createEncrypt(keystore.get('gBdaS-G8RLax2qgObTD94w')).
                        update(shareOBJ.id).
                        final().
                        then(function (result) {
                            // {result} is a JSON Object -- JWE using the JSON General Serialization
                            res.send(result);
                        });
                    });
                }
            });
        });
});

//load
app.post('/node/fintechShare/secure/load/', function (req, res) {
    // res.send('example data');
    var cypher = ('body: ', req.body.cypher);
    jose.JWE.createDecrypt(keystore.get('ServerKey')).
    decrypt(cypher).
    then(function (result) {

        shareModel.findOne({
            "id": result.id
        }, function (err, data) {
            if (err) return res.status(400).send('Error not found data in DB: ' + err);
            // Prints "Space Ghost is a talk show host".
            else {
                console.log(data);
                jose.JWE.createEncrypt(keystore.get('ServiceKeys')).
                update(data).
                final().
                then(function (result) {
                    // {result} is a JSON Object -- JWE using the JSON General Serialization
                    res.send(result);
                });
            }
        });
    }).catch(err => res.status(404).send('Decryption Error: '+err));
});
app.listen(process.env.PORT, () => console.log('Example app listening on port '+process.env.PORT));
//server.listen(port, () => console.log(`App running on port ${port}`));
//serverHttps.listen(port, () => console.log(`App running on port ${port}`));
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


//this section for fintech chart demo
//get and send data to ui for generate graph
app.get('/node/fintechShare/secure/:tickerurl', (req, res, next) => {
    
    var getCollectionStock;
    var getTickerURL = req.params.tickerurl;
    switch (getTickerURL) {
      case "ptt":
        getCollectionStock = pttModel;
        break;
      case "cpall":
        getCollectionStock = cpallModel;
        break;
      case "dtac":
        getCollectionStock = dtacModel;
        break;
      case "aot":
        getCollectionStock = aotModel;
        break;
      case "kbank":
        getCollectionStock = kbankModel;
        break;
    }
    getCollectionStock.find({}).select({ "_id": 0 }).limit(50)
      .then(function (doc) {
  
        res.render('candlechart', { items: doc });
      }),
      function (err) {
  
      console.error("Error in find collection "+err);
      }
  });
//save data to database
  app.post('/node/fintechShare/secure/:tickerurl', function (req, res) {
    var postTickerURL = req.params.tickerurl;
    var myData;
    var postCollectionStock;
    var guid = guid();
    var myData = {
      id: guid,
      NameTicker: ('body: ', req.body.ticker),
      StartDate: ('body: ', req.body.startDateInput),
      EndDate: ('body: ', req.body.endDateInput),
      DataImage: ('body: ', req.body.img)
    }
  
    switch (postTickerURL) {
      case "PTT":
      case "CPALL":
      case "DTAC":
      case "AOT":
      case "KBANK":
        postCollectionStock = new shareModel(myData).save()
          .then(item => {
            res.send(guid);
            console.log('Item inserted');
          }, err=>{
              console.error('Item inserted Error'+err);
              res.status(500).send(err.message);
        })
        break;
      default:
        res.status(400).send('ticket undified');
    }
  });