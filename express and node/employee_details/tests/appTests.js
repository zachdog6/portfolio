"use strict";
require('dotenv').config({ path: './../.env' });
var chai = require('chai');
chai.should();
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

var app = require('../app');
var server = app.server;
var users;

describe('/api/employee tests', function () {
    it('should post employee Bob into EMP_DTL Table', function (done) {
        chai.request(server)
            .post('/api/employee')
            .send({ 'user': { name: 'Bob', email: 'bob@email.com', username: 'bob', password: 'bob' } })
            .end(function (err, res) {
                res.status.should.equal(200);
                res.text.should.contain('Post Successful');
                done();
            });
    });
    it('should login employee Bob', function (done) {
        chai.request(server)
            .post('/api/employee/login')
            .send({ 'user': { username: 'bob', password: 'bob' } })
            .end(function (err, res) {
                res.status.should.equal(200);
                done();
            });
    });
    it('should return all employees from EMP_DTL Table', function (done) {
        chai.request(server)
            .get('/api/employee')
            .end(function (err, res) {
                res.status.should.equal(200);
                res.text.should.contain('Bob');
                users = JSON.parse(res.text);
                done();
            });
    });
    it('should replace bob with sara in EMP_DTL Table', function (done) {
        chai.request(server)
            .put('/api/employee/' + (users[users.length - 1].id))
            .send({ 'user': { name: 'Sara', email: 'sara@email.com', username: 'bob', password: 'bob' } })
            .end(function (err, res) {
                res.status.should.equal(200);
                res.text.should.contain('Put Successful');
                done();
            });
    });
    it('should return sara from EMP_DTL Table', function (done) {
        chai.request(server)
            .get('/api/employee/' + (users[users.length - 1].id))
            .end(function (err, res) {
                res.status.should.equal(200);
                res.text.should.contain('Sara');
                done();
            });
    });
    it('should delete posted employee from EMP_DTL Table', function (done) {
        chai.request(server)
            .delete('/api/employee/' + (users[users.length - 1].id))
            .end(function (err, res) {
                res.status.should.equal(200);
                res.text.should.contain('Delete Successful');
                done();
            });
    });
    after(() => {
        app.shutdown();
    });
});
