var express = require("express");
var app = express();
var session = require("express-session");

/**
 * Example of using Express.JS to create a server side website
 */
app.set("view engine", "pug");
app.set("views","./views");

app.use(session({
    secret: "express example",
    resave: false,
    saveUninitialized: true
}));

app.get("/", loginCheck, (req, res) => {
    res.render("index", {username:req.session.username});
});

var files = require("./files");
app.use("/files", loginCheck, files);

var login = require("./login");
app.use("/login", login);

app.get("/logout", (req, res) => {
    delete req.session.username;
    res.redirect("/login");
});

app.get("*", (req, res) => {
    res.render("err", {err:"the requested page does not exist"});
});

app.use((err, req, res, next) => {
    if(err)
        res.redirect("/login");
    else
        next();
});

function loginCheck(req, res, next) {
    if(req.session.username) {
        next();
    } else {
        next("user not logged in");
    }
}

app.listen(8080);