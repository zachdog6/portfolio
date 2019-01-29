"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var query = require("./sequalizedQueries");
var login = require("./login");
var logger = require("./logger");

var app = express();
app.use(bodyParser.json());

var cors = require("cors");
app.use(cors());

app.get("/api/employee", (req, res) => {
    query.getAll(res);
});

app.get("/api/employee/:id", (req, res) => {
    query.getById(res, req.params.id);
});

/**
 * Confirms employee exists with given username and password
 * 
 * returns employee if correct info
 */
app.post("/api/employee/login", (req, res) => {
    let user = req.body.user;

    if (typeof user == "undefined") {
        res.status(400).send("No user object given");
    }
    else if ((!user.hasOwnProperty("username")) || (!user.hasOwnProperty("password"))) {
        res.status(400).send("User object does not have all properties");
    }
    else {
        query.login(res, user.username, user.password);
    }
});

/**
 * Post employee into database
 */
app.post("/api/employee", (req, res) => {
    let user = req.body.user;

    if (typeof user == "undefined") {
        res.status(400).send("No user object given");
    }
    else if ((!user.hasOwnProperty("name")) || (!user.hasOwnProperty("email"))
    || (!user.hasOwnProperty("username")) || (!user.hasOwnProperty("password"))) {
        res.status(400).send("User object does not have all properties");
    }
    else {
        query.usernameCheck(user.username, (testVal) => {
            if (testVal) {
                res.status(400).send("User with given username already exists");
            }
            else {
                let data = login.newPassword(user.password);

                query.post(res, {name: user.name, email: user.email, username: user.username, password: data.passwordHash, salt: data.salt});
            }
        });
    }
});

/**
 * Update employee with given id
 */
app.put("/api/employee/:id", (req, res) => {
    let user = req.body.user;

    if (typeof user == "undefined") {
        res.status(400).send("No user object given");
    }
    else if ((!user.hasOwnProperty("name")) || (!user.hasOwnProperty("email"))
    || (!user.hasOwnProperty("username")) || (!user.hasOwnProperty("password"))) {
        res.status(400).send("User object does not have all properties");
    }
    else {
        query.usernameCheckWithExp(user.username, req.params.id, (testVal) => {
            if (testVal) {
                res.status(400).send("User with given username already exists");
            }
            else {
                query.idCheck(res, req.params.id, (testVal2) => {
                    if(!testVal2){
                        res.status(400).send("employee with id " + req.params.id + " does not exist");
                    }
                    else{
                        let data = login.newPassword(user.password);

                        query.put(res, {name: user.name, email: user.email, username: user.username, password: data.passwordHash, salt: data.salt}, req.params.id);
                    }
                });
            }
        });
    }
});

app.delete("/api/employee/:id", (req, res) => {
    query.delete(res, req.params.id);
});

let server = app.listen(8080, () => {
    logger.info("Server opened on port: 8080");
});

module.exports.shutdown = () =>{
    server.close();
    query.close();
    logger.info("shutdown server");
};

module.exports.server = server;