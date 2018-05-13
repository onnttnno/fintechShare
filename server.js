const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jose = require('node-jose');
var https = require('https');
const server = require('http').createServer(app);
const serverHttps = https.createServer(app);
var keystore; //= jose.JWK.createKeyStore();
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 3000;
//mongo lib

var forge = require('node-forge');
var pki = forge.pki;
forge.options.usePureJavaScript = true;
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
    var keys = pki.rsa.generateKeyPair(2048);
    keystore = keys;
    console.info(pki.publicKeyToPem(keystore.publicKey));
    var key = forge.random.getBytesSync(16);
    var iv = forge.random.getBytesSync(16);
    keystore.aesKey = key;
    keystore.aesIV = iv;
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
    var decrypted = keystore.privateKey.decrypt(chipher, 'RSA-OAEP');
    console.log("decypted data : "+decrypted);
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
    res.send('handShake completed');
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

//load img adn data
app.post('/node/fintechShare/secure/load/', function (req, res) {
    var chipher = req.body;
    var cypher = Object.keys(chipher);
    console.info("cypher load : " + cypher);
    var buf = Buffer.from(cypher, 'base64');
    console.info("cypher byte : " + buf);
    console.log(pki.keystore.privateKey);
    var data = keystore.privateKey.decrypt(buf, 'RSA-OAEP');
    shareModel.find({
        "Ticket": data
    }, function (err, data) {
        if (err) return res.status(400).send('Error not found data in DB: ' + err);
        // Prints "Space Ghost is a talk show host".
        else {
            console.log(data);
            /*jose.JWE.createEncrypt(keystore.get('ServiceKeys')).
            update(data).
            final().
            then(function (res) {
                // {result} is a JSON Object -- JWE using the JSON General Serialization
                res.send(res);
            });*/
            let start = data.StartDate;
            let end = data.endDateInput;
            let ticker = data.NameTicker;

            var getCollectionStock;
            switch (ticker) {
                case "ptt":
                    getCollectionStock = pttModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                case "cpall":
                    getCollectionStock = cpallModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                case "dtac":
                    getCollectionStock = dtacModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                case "aot":
                    getCollectionStock = aotModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                case "kbank":
                    getCollectionStock = kbankModel;
                    findNowSpacific(getCollectionStock, res, start, end);
                    break;
                default:
                    break;
            }

        }
    });

});
app.listen(process.env.PORT, () => console.log('Example app listening on port ' + process.env.PORT));
//server.listen(port, () => console.log(`App running on port ${port}`));
//serverHttps.listen(port, () => console.log(`App running on port ${port}`));

//open shared data
app.get('/node/fintechShare/secure/open/:cypher', function (req, res) {

    var cypher = req.params.cypher;
    jose.JWE.createDecrypt(keystore.get('ServerKey')).
    decrypt(cypher).
    then(function (data) {
        let start = data.StartDate;
        let end = data.EndDate;
        let ticker = data.ticker;

        var getCollectionStock;
        switch (ticker) {
            case "ptt":
                getCollectionStock = pttModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            case "cpall":
                getCollectionStock = cpallModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            case "dtac":
                getCollectionStock = dtacModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            case "aot":
                getCollectionStock = aotModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            case "kbank":
                getCollectionStock = kbankModel;
                findNowSpacific(getCollectionStock, res, start, end);
                break;
            default:
                break;
        }
    });
});

function findNowSpacific(getCollectionStock, res, start, end) {
    getCollectionStock.find({}).select({
            "_id": 0
        }).where('Date').gt(start).lt(end)
        .then(function (doc) {

            //res.render('candlechart', { items: doc });
            //res.send(doc);
            /* jose.JWE.createEncrypt(keystore.get('ServiceKeys')).
             update(doc).
             final().
             then(function (res) {
                 // {result} is a JSON Object -- JWE using the JSON General Serialization
                 res.send(res);
             });*/
            //res.send(doc);//may be ...
            var templet = ejs.render('candlechart', {
                items: doc
            });
            var htmlString = templet.then(function () {
                htmlString = document.getElementsByTagName('html')[0].innerHTML;
            });
            htmlString.then(function () {
                var chipher = PKservice.encrypt(htmlString, 'RSA-OAEP', {
                    md: forge.md.sha256.create(),
                    mgf1: {
                        md: forge.md.sha1.create()
                    }
                });
                //res.render(doc);
                res.send(chipher);
            });
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

    var myData = {
        Ticket: guid(),
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
                    console.log('Item inserted');
                    console.log("triket: " + item.Ticket);
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