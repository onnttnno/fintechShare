var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();
var jose = require('node-jose');
var keystore = jose.JWK.createKeyStore();
chai.use(chaiHttp);

describe('API framwork', function () {
    it('get public key', function (done) {
        chai.request(server)
            .get('/node/fintechShare/secure/getPublicKey')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('get ptt', function (done) {
        chai.request(server)
            .get('/node/fintechShare/secure/ptt')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('get cpall', function (done) {
        chai.request(server)
            .get('/node/fintechShare/secure/cpall')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('get dtac', function (done) {
        chai.request(server)
            .get('/node/fintechShare/secure/dtac')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('get aot', function (done) {
        chai.request(server)
            .get('/node/fintechShare/secure/aot')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('get aot', function (done) {
        chai.request(server)
            .get('/node/fintechShare/secure/aot')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('get kbank', function (done) {
        chai.request(server)
            .get('/node/fintechShare/secure/kbank')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
});