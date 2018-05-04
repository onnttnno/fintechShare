//require('node-jose')
//require('ejs.min')
//var jose;
//var ejs;
var hi = "Script is well";
var service = function () {
    var keystore = jose.JWK.createKeyStore();
    this.init = function (api, token) {
        //request public key
        /*https.get('http://110.164.179.154/node/fintechShare/secure/getPublicKey', (resp) => {
         
         // A chunk of data has been recieved.
         resp.on('data', (key) => {
         keystore.add(key, "pem").
         then(function (result) {
         // {result} is a jose.JWK.Key
         return handshake(api, token);
         });
         
         });
         }).on("error", (err) => {
         console.log("Error: " + err.message);
         return "Error when init : "+err.message;
         });*/
        var props = {
        kid: 'ServiceKeys',
        alg: 'A256GCM',
        use: 'enc'
        };
        return keystore.generate("oct", 1024, props).
        then(function (result) {
             // {result} is a jose.JWK.Key
             key = result;
             console.log("generate Key completed");
             
             var client = new HttpClient();
             client.get('http://110.164.179.154/node/fintechShare/secure/getPublicKey', function (response) {
                        // do something with response
                        keystore.add(response, "pem").
                        then(function (result) {
                             // {result} is a jose.JWK.Key
                             return handshake(api, token);
                             });
                        });
             });
    }
    
    function handshake(api, token) {
        let data = {
            "api": api,
            "token": token,
            "pK": keystore.get('ServiceKeys').toPEM()
        };
        jose.JWE.createEncrypt(keystore.get('ServerKey')).
        update(data).
        final().
        then(function (cypher) {
             // {cypher} is a JSON Object -- JWE using the JSON General Serialization
             
             /*https.get('http://110.164.179.154/node/fintechShare/secure/handShake/' + cypher, (resp) => {
              
              // A chunk of data has been recieved.
              resp.on('data', (dat) => {
              console.log(dat);
              jose.JWE.createDecrypt(keystore.get('ServiceKeys')).
              decrypt(dat).
              then(function (result) {
              console.log(result);
              return result;
              });
              });
              
              }).on("error", (err) => {
              console.log("Error: " + err.message);
              return "Error when handshake : "+err.message;
              });*/
             
             var client = new HttpClient();
             client.get('http://110.164.179.154/node/fintechShare/secure/handShake/' + cypher, function (response) {
                        // do something with response
                        jose.JWE.createDecrypt(keystore.get('ServiceKeys')).
                        decrypt(dat).
                        then(function (result) {
                             console.log(result);
                             return result;
                             });
                        });
             });
        
    }
    
    this.load = function (url) {
        jose.JWE.createEncrypt(keystore.get('ServerKey')).
        update(url).
        final().
        then(function (cypher) {
             // {cypher} is a JSON Object -- JWE using the JSON General Serialization
             
             /* https.get('http://110.164.179.154/node/fint
              /secure/load/' + cypher, (resp) => {
              
              // A chunk of data has been recieved.
              resp.on('data', (dat) => {
              console.log(dat);
              return dat;
              });
              
              }).on("error", (err) => {
              console.log("Error: " + err.message);
              return err;
              });*/
             
             var client = new HttpClient();
             client.get('http://110.164.179.154/node/fintechShare/secure/load/' + cypher, function (response) {
                        // do something with response
                        return response;
                        });
             
             });
        
    }
    this.open = function (persistData) {
        //render here
        ejs.render('candlechart', {
                   item: persistData
                   })
        
    }

    var HttpClient = function () {
        this.get = function (aUrl, aCallback) {
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.onreadystatechange = function () {
                if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                    aCallback(anHttpRequest.responseText);
            }
            
            anHttpRequest.open("GET", aUrl, true);
            anHttpRequest.send(null);
        }
    }
    
}



service.instance = null;

/**
 * Singleton getInstance definition
 * @return singleton class
 */
service.getInstance = function () {
    if (this.instance === null) {
        this.instance = service();
    }
    return this.instance;
}

var serviceShare = service.getInstance();


var echo = function(test){
    return test;
}




