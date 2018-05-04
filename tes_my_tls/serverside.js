const express = require('express');
const app = express();
const ntru = require("ntru");
const keyPair /*: {privateKey: Uint8Array; publicKey: Uint8Array} */ = ntru.keyPair();
var KeyService;

function stringToArray(bufferString) {
	let uint8Array = new TextEncoder("utf-8").encode(bufferString);
	return uint8Array;
}
function arrayToString(bufferValue) {
	return new TextDecoder("utf-8").decode(bufferValue);
}

app.get('/pk', function (req, res) {
    //res.send(kP.keypair.publicKey);
    keyPair.then(function(key){
        console.log('pk stage'+ typeof key);
        res.send(key.publicKey);
    });
});
app.post('/HS', function (req, res) {
    console.log('HS stage');
    console.log(req.body);
    KeyService = req.body;
    res.send('Hello World!');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));