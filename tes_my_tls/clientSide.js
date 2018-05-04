forge.options.usePureJavaScript = true;
//get public Key form swift 
var serverpublicKey;
var serviceKey;
var serverpublicKey = axios.get('http://110.164.179.154/node/fintechShare/secure/getPublicKey')
    .then(function (response) {
        setserverpublicKey(response.body);
    })
    .catch(function (error) {
        console.log(error);
    });

function setserverpublicKey(pk) {
    serverpublicKey = key;
}


var instance = forge.rsa.generateKeyPair({
    bits: 2048,
    workers: -1
}, function (err, keypair) {
    // keypair.privateKey, keypair.publicKey
    serviceKey = keypair;
});

function handshakeCipher() {
    return instance.then(function () {
       return serverpublicKey.then(function () {
            var encrypted = serverpublicKey.encrypt(serviceKey.publicKey, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha1.create()
                }
            });
            return encrypted.then(function(chipher){
                axios.get('http://110.164.179.154/node/fintechShare/secure/handShake/?cypher='+chipher)
                .then(function (response) {
                    //return response;
                    var decrypted = keystore.privateKey.decrypt(response.body, 'RSA-OAEP', {
                        md: forge.md.sha256.create(),
                        mgf1: {
                          md: forge.md.sha1.create()
                        }
                      });
                      if(pack(decrypted) == 'handShake success'){
                          return pack(decrypted);
                      }
                      else{
                          Promise.reject('Hand shake not complete');
                      }
                })
                .catch(function (error) {
                    return error;
                });
            });
        });
    });
}

function decryptedAndload(ticker) {
   return serverpublicKey.encrypt(ticker, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
            md: forge.md.sha1.create()
        }
    }).then(function(cypherToServer){
        axios.get('http://110.164.179.154/node/fintechShare/secure/load/', {
            params: {
                cypher: cypherToServer
            }
          })
          .then(function (response) {
            var decrypted = serviceKey.privateKey.decrypt(response, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha1.create()
                }
                
          }).then(function(data){
            return ejs.render('candlechart', {
                    items: res
                });
            
          })
          .catch(function (error) {
            Promise.reject(error);
          });
    });
    
    });
}

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

/**
 * // encrypt data with a public key using RSAES-OAEP
var encrypted = publicKey.encrypt(bytes, 'RSA-OAEP');
 
// decrypt data with a private key using RSAES-OAEP
var decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP');
 */
/*var forge = require('node-forge');
forge.rsa.generateKeyPair({bits: 2048, workers: -1}, function(err, keypair) {
    // keypair.privateKey, keypair.publicKey
    
  // generate and encapsulate a 16-byte secret key
  var kdf1 = new forge.kem.kdf1(forge.md.sha1.create());
  var kem = forge.kem.rsa.create(kdf1);
  var result = kem.encrypt(keypair.publicKey, 16);
  // result has 'encapsulation' and 'key'
   
  // encrypt some bytes
  var iv = forge.random.getBytesSync(12);
  var someBytes = 'hello world!';
  var cipher = forge.cipher.createCipher('AES-GCM', result.key);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(someBytes));
  cipher.finish();
  var encrypted = cipher.output.getBytes();
  var tag = cipher.mode.tag.getBytes();
   console.log(cipher);*/
// send 'encrypted', 'iv', 'tag', and result.encapsulation to recipient
/*
  // decrypt encapsulated 16-byte secret key
  var kdf1 = new forge.kem.kdf1(forge.md.sha1.create());
  var kem = forge.kem.rsa.create(kdf1);
  var key = kem.decrypt(keypair.privateKey, result.encapsulation, 16);
   
  // decrypt some bytes
  var decipher = forge.cipher.createDecipher('AES-GCM', key);
  decipher.start({iv: iv, tag: tag});
  decipher.update(forge.util.createBuffer(encrypted));
  var pass = decipher.finish();
  // pass is false if there was a failure (eg: authentication tag didn't match)
  if(pass) {
    // outputs 'hello world!'
    console.log(decipher.output.getBytes());
  }
  });