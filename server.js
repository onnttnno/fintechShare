var express = require('express');
var app = express();
const mongoose = require('mongoose');
var jose = require('node-jose');
var keystore = jose.JWK.createKeyStore();

//mongo lib
mongoose.connect('mongodb://localhost/data').then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ console.log('Mongo conected'); },
    err => { /** handle initial connection error */  console.error(err);}
  );
//mongo schema
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
 
const dataSchema = new Schema({
 id: ObjectId,
 data: String,
 image:String
});

var Data = mongoose.model('Data', dataSchema);

const dataAPI =new Schema({
    api:String,
    tokens:String
   });

var API = mongoose.model('API',dataAPI);

//init keystore
var props = {
    kid: 'gBdaS-G8RLax2qgObTD94w',
    alg: 'A256GCM',
    use: 'enc'
  };
  keystore.generate("oct", 512, props).
          then(function(result) {
              console.log(result);
          });


 
//public key
app.get('/getPublicJey', function (req, res) {
    key = keystore.get('gBdaS-G8RLax2qgObTD94w');
    res.send(key.toJSON());
});
 
//hand shake
app.get('/handShake', function (req, res) {

    jose.JWE.createDecrypt(keystore.get('gBdaS-G8RLax2qgObTD94w')).
        decrypt(req.body).
        then(function(result) {
          // {result} is a Object with:
          // *  header: the combined 'protected' and 'unprotected' header members
          // *  protected: an array of the member names from the "protected" member
          // *  key: Key used to decrypt
          // *  payload: Buffer of the decrypted content
          // *  plaintext: Buffer of the decrypted content (alternate)
          var shareOBJ = new API({ api: result.api,tokens:result.tokens });

          shareOBJ.save(function (err, r) {
            if (err) 
            {
                res.send('API error');    
            }

            else{
            res.send('save complete'+r);
            }
          });
          API.find({api:result.api},function(err,data){
              if(err){
                  console.log(err);
              }
              else{
                  console.log(data);
              }

          });





          res.send('save complete');
        });
  });

//save
app.post('/save', function (req, res) {
    res.send('save complete');

    jose.createDecrypt(keystore.get('gBdaS-G8RLax2qgObTD94w'))
    .decrypt(req.body)
    .then(function(result) {
        var shareOBJ = new Data({ id: guid(),data:result.data,image:result.image });

        shareOBJ.save(function (err, r) {
          if (err) 
          {
              res.send('server save error'); 
 
          }

          else{
          shareOBJ.save(function (err, shareOBJ) {
            if (err) return console.error(err);
            jose.JWE.createEncrypt(keystore.get('gBdaS-G8RLax2qgObTD94w')).
            update(shareOBJ.id).
            final().
            then(function(result) {
            // {result} is a JSON Object -- JWE using the JSON General Serialization
            res.send(result);
            });
          });  
          }
        });
    });
  });

//load
app.get('/load/:tokens', function (req, res) {
   // res.send('example data');
    var token = req.params.tokens;
    Data.findOne({ id: token }, function (err, data) {
        if (err) return res.send('Error: '+err);
        // Prints "Space Ghost is a talk show host".
        else{
            console.log(data);
            jose.JWE.createEncrypt(keystore.get('gBdaS-G8RLax2qgObTD94w')).
            update(data).
            final().
            then(function(result) {
            // {result} is a JSON Object -- JWE using the JSON General Serialization
                res.send(result);
            });
        }
      });
  });
app.listen(3000);



function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }