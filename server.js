const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jose = require('node-jose');
var https = require('https');
const server = require('http').createServer(app);
const serverHttps = https.createServer(app);
const ejs = require('ejs');
//= jose.JWK.createKeyStore();
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 3000;
var fs = require('fs');
//for encypt


//mongo lib

var forge = require('node-forge');
var pki = forge.pki;
forge.options.usePureJavaScript = true;
var keystore = pki.rsa.generateKeyPair(2048);
keystore.aesKey = forge.random.getBytesSync(32);
keystore.aesIV = forge.random.getBytesSync(32);
///serverside
var kdf1;
var kem;
var encap;
//client side
var PKservice;
var cert;
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
//require('./UI-chart/libs/db-connection');

/**connection DB********************************************************************************************* */
//chart
const dbChart = mongoose.createConnection('mongodb://localhost/Chart');
dbChart.on('connected', function (res) {
    console.log('DBchart connected')
});
dbChart.on('disconnected', function (err) {
    console.log('DBchart cant connecting: ' + err)
});

//share
const dbShare = mongoose.createConnection('mongodb://localhost/data');
dbChart.on('connected', function (res) {
    console.log('DBShare connected')
});
dbShare.on('disconnected', function (err) {
    console.log('DBShare cant connecting: ' + err)
});
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
const apiModel = dbShare.model('API', API);
const shareModel = dbShare.model('PTTsave', SHARE);
//model of chart
const kbankModel = dbChart.model('KBANK', KBANK);
const aotModel = dbChart.model('AOT', AOT);
const dtacModel = dbChart.model('DTAC', DTAC);
const cpallModel = dbChart.model('CPALL', CPALL);
const pttModel = dbChart.model('PTT', PTT);
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
/*
//init keystore
var props = {
    kid: 'ServerKey',
    alg: 'A256GCM',
    use: 'enc'
};
keystore.generate("oct", 1024, props).
then(function (result) {
    console.log(result);
});*/


app.get('/node/fintechShare/secure', (req, res) => res.send('connection completed!'))

//public key
app.get('/node/fintechShare/secure/getPublicKey', function (req, res) {
    /*key = keystore.get('ServerKey');
    res.send(key.toJSON());*/
    // console.log(_arrayBufferToBase64(keystore.publicKey));
    // convert a Forge public key to PEM-format
    // generate a keypair and create an X.509v3 certificate
    console.info(pki.publicKeyToPem(keystore.publicKey));
    res.send(pki.publicKeyToPem(keystore.publicKey));

});

//hand shake
app.post('/node/fintechShare/secure/handShake/', function (req, res) {
    /*    console.info('test encrypted');
        var message = 'abc';
        var buffer = forge.util.createBuffer(message, 'utf8');
        var binaryString = buffer.getBytes();
        console.log("raw data : "+message);
        // encrypt data with a public key using RSAES-OAEP
        var encrypted = keystore.publicKey.encrypt(binaryString, 'RSA-OAEP');
        console.log("cypher data "+typeof encrypted  +" : "+encrypted);
        // decrypt data with a private key using RSAES-OAEP
        var decrypted = keystore.privateKey.decrypt(encrypted, 'RSA-OAEP');
        console.log("decypted data "+typeof decrypted  +" : "+decrypted);
    */
    var chipher = req.body.cypher;
    console.log("log data : " + chipher);
    //var data = Buffer.from(Object.keys(chipher)[0], 'base64');
    //var forgeBuffer = forge.util.createBuffer(data.toString('base64'));
    var decrypted = forge.util.decodeUtf8(keystore.privateKey.decrypt(chipher, 'RSA-OAEP'));
    console.log("decypted data : " + decrypted);
    var jsondecrypted = JSON.parse(decrypted);
    /* var cypher =  pki.publicKeyFromPem(Object.keys(chipher));
    var decrypted = keystore.privateKey.decrypt(cypher, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
    });
    console.log(decrypted);
    var json = JSON.parse(decrypted);
    */
    /*console.log("hand shake request data  "+Object.keys(chipher));
    // chipher =_base64ToArrayBuffer(chipher);
    var decrypted = keystore.privateKey.decrypt(Object.keys(chipher), 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha1.create()
        }
    });
    PKservice = decrypted;
    console.log('decrypted data HS : '+decrypted)*/
    keystore.service3DesIV = jsondecrypted.iv;
    keystore.service3DesKey = jsondecrypted.key;
    keystore.service3DesPWD = jsondecrypted.pwd;
    var json = {
        'status': "hand Shake completed"
    };
    var data = JSON.stringify(json);
    var salt = forge.random.getBytesSync(8);
    // var md = forge.md.sha1.create(); // "-md sha1"
    var derivedBytes = forge.pbe.opensslDeriveBytes(
        keystore.service3DesPWD, salt, keystore.service3DesKey + keystore.service3DesIV /*, md*/ );

    var buffer = forge.util.createBuffer(derivedBytes);
    var key = buffer.getBytes(keystore.service3DesKey);
    var iv = buffer.getBytes(keystore.service3DesIV);

    var cipher = forge.cipher.createCipher('3DES-CBC', key);
    cipher.start({
        iv: iv
    });
    cipher.update(forge.util.createBuffer(data, 'raw'));
    cipher.finish();

    var output = forge.util.createBuffer();

    // if using a salt, prepend this to the output:
    if (salt !== null) {
        output.putBytes('Salted__'); // (add to match openssl tool output)
        output.putBytes(salt);
    }
    output.putBuffer(cipher.output);
    var cypher = output.getBytes();

    console.log(cypher);

    res.send(cypher);
});


//load img adn data
app.post('/node/fintechShare/secure/load/', function (req, res) {
    var chipher = req.body.cypher;

    console.info("cypher load : " + chipher);
    // console.info(JSON.stringify(keystore));
    var input = forge.util.createBuffer(chipher, 'raw');
    // skip "Salted__" (if known to be present)
    input.getBytes('Salted__'.length);
    // read 8-byte salt
    var salt = input.getBytes(8);

    var derivedBytes = forge.pbe.opensslDeriveBytes(
        keystore.service3DesPWD, salt, keystore.service3DesIV + keystore.service3DesKey);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = buffer.getBytes(keystore.service3DesKey);
    var iv = buffer.getBytes(keystore.service3DesIV);

    var decipher = forge.cipher.createDecipher('3DES-CBC', key);
    decipher.start({
        iv: iv
    });
    decipher.update(input);
    var result = decipher.finish();

    console.log("decrypted data" + decipher.output.getBytes());
    var ticket = decipher.output.getBytes();

    shareModel.find({
        Ticket: ticket
    }).select({
        "_id": 0
    }).then(function (data) {
        // Prints "Space Ghost is a talk show host".
        console.log("get framwoke data " + typeof data + "  " + data[0].NameTicker);
        var start = data[0].StartDate;
        var end = data[0].EndDate;
        var ticker = data[0].NameTicker;
        console.log(ticker + "   " + end + "  " + start);

            console.log("Object here : " + JSON.stringify(data));
            /*jose.JWE.createEncrypt(keystore.get('ServiceKeys')).
            update(data).
            final().
            then(function (res) {
                // {result} is a JSON Object -- JWE using the JSON General Serialization
                res.send(res);
            });*/
            var getCollectionStock;
            switch (ticker) {
                case "PTT":
                    getCollectionStock = pttModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                case "CPALL":
                    getCollectionStock = cpallModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                case "DTAC":
                    getCollectionStock = dtacModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                case "AOT":
                    getCollectionStock = aotModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                case "KBANK":
                    getCollectionStock = kbankModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                default:
                    console.log("stock name not found");
                    res.status(404);
                    break;
            

        }
    }).catch(function (err) {
        console.error(err);
        res.status(404);
      });

});
app.listen(process.env.PORT, () => console.log('Example app listening on port ' + process.env.PORT));
//server.listen(port, () => console.log(`App running on port ${port}`));
//serverHttps.listen(port, () => console.log(`App running on port ${port}`));

//open shared data
app.get('/node/fintechShare/secure/open/:cypher', function (req, res) {

    console.log("param : " + req.params.cypher);
    shareModel.find({
        Ticket: req.params.cypher
    }).select({
        "_id": 0
    }).then(function (data) {
        console.log("get framwoke data " + typeof data + "  " + data[0].NameTicker);
        var start = data[0].StartDate;
        var end = data[0].EndDate;
        var ticker = data[0].NameTicker;
        console.log(ticker + "   " + end + "  " + start);
        var getCollectionStock;
        switch (ticker) {
            case "PTT":
                getCollectionStock = pttModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            case "CPALL":
                getCollectionStock = cpallModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            case "DTAC":
                getCollectionStock = dtacModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            case "AOT":
                getCollectionStock = aotModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            case "KBANK":
                getCollectionStock = kbankModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            default:
                console.log("stock name not found " + ticker);
                res.status(404);
                break;
        }
    });
});

//fillter data 
function fillterdata(doc, start, end) {

    var data = [];
    var fDate, lDate, cDate;

    fDate = new Date(start.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    lDate = new Date(end.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    var count = 0;
    for (i = 0; i < doc.length; i++) {

        cDate = new Date(doc[i].Date);
        if ((cDate <= lDate) && (cDate >= fDate)) {
            //data[i].push(doc[i]);
            data.push(doc[i]);
            count++;
        }

    }
    return data;

}


function findNowSpacific(getCollectionStock, res, start, end) {
    getCollectionStock.find({}).select({
            "_id": 0
        })
        .then(function (doc) {
            console.log("chart data : " + doc);
            var dat = fillterdata(doc, start, end);
            console.log(JSON.stringify(dat));
            console.log("all data " + dat);
            var file = fs.readFileSync(__dirname + '/views/candlechart.ejs', 'ascii');
            var htmlString = ejs.render(file,  {
                    items : dat
                }
            );

            console.log('html string : ' + htmlString);
             var cypher;
              var salt = forge.random.getBytesSync(8);
              // var md = forge.md.sha1.create(); // "-md sha1"
              var derivedBytes = forge.pbe.opensslDeriveBytes(
                  keystore.service3DesPWD, salt, keystore.service3DesKey + keystore.service3DesIV  );

              var buffer = forge.util.createBuffer(derivedBytes);
              var key = buffer.getBytes(keystore.service3DesKey);
              var iv = buffer.getBytes(keystore.service3DesIV);

              var cipher = forge.cipher.createCipher('3DES-CBC', key);
              cipher.start({
                  iv: iv
              });
              cipher.update(forge.util.createBuffer(htmlString, 'binary'));
              cipher.finish();

              var output = forge.util.createBuffer();

              
              if (salt !== null) {
                  output.putBytes('Salted__'); 
                  output.putBytes(salt);
              }
              output.putBuffer(cipher.output);
              cypher = output.getBytes();

              console.log(cypher);
              
            res.send(cypher);

        }),
        function (err) {
            console.error("Error in find collection " + err);
            res.status(500).send(err);
        }
}
//this section for fintech chart demo
//get and send data to ui for generate graph
app.get('/node/fintechShare/secure/:tickerurl', (req, res, next) => {

    var getCollectionStock;
    var getTickerURL = req.params.tickerurl;
    switch (getTickerURL) {
        case "ptt":
            getCollectionStock = pttModel;
            findNow(getCollectionStock, res);
            break;
        case "cpall":
            getCollectionStock = cpallModel;
            findNow(getCollectionStock, res);
            break;
        case "dtac":
            getCollectionStock = dtacModel;
            findNow(getCollectionStock, res);
            break;
        case "aot":
            getCollectionStock = aotModel;
            findNow(getCollectionStock, res);
            break;
        case "kbank":
            getCollectionStock = kbankModel;
            findNow(getCollectionStock, res);
            break;
        default:
            break;
    }
});

function findNow(getCollectionStock, res) {
    getCollectionStock.find({}).select({
            "_id": 0
        }).limit(50)
        .then(function (doc) {
            console.log(" data form DB is " + doc + " instance of " + typeof doc);
            res.render('candlechart', {
                items: doc
            });
        }),
        function (err) {
            console.error("Error in find collection " + err);
            res.status(500).send(err);
        }
}
//save data to database
app.post('/node/fintechShare/secure/:tickerurl', function (req, res) {
    var postTickerURL = req.params.tickerurl;
    var myData;
    var postCollectionStock;

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    //var guid = guid();

    console.log(JSON.stringify(req.body));
    var myData = {
        Ticket: guid(),
        NameTicker: req.body.ticker,
        StartDate: req.body.startDateInput,
        EndDate: req.body.endDateInput,
        DataImage: req.body.img
    }

    switch (postTickerURL) {
        case "PTT":
        case "CPALL":
        case "DTAC":
        case "AOT":
        case "KBANK":
            postCollectionStock = new shareModel(myData).save()
                .then(item => {
                    console.log('Item inserted');
                    console.log("triket: " + item);
                    res.send(item.Ticket);



                }, err => {
                    console.error('Item inserted Error' + err);
                    res.status(500).send(err.message);
                })
            break;
        default:
            res.status(400).send('ticket undified');
    }
});

function pack(bytes) {
    var chars = [];
    for (var i = 0, n = bytes.length; i < n;) {
        chars.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
    }
    return String.fromCharCode.apply(null, chars);
}

function unpack(str) {
    var bytes = [];
    for (var i = 0, n = str.length; i < n; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char >>> 8, char & 0xFF);
    }
    return bytes;
}