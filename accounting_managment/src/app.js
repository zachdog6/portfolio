var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
var session = require("express-session");
var indexRouter = require("./routes/index");
var loginRouter = require("./routes/login");
var bodyParser = require("body-parser");
var path = require("path");
var dotenv = require("dotenv");
var accountingRouter = require("./routes/accounting");
var userRouter = require("./routes/user");
global.fetch = require("node-fetch");

//Setup
dotenv.config();

var app = express();

app.use(session({
    secret: "accounting_managment",
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "pug");
app.set("views", path.join(__dirname,"/views"));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

//Routing

//public
app.use("/login", loginRouter);

//protected
app.use("/", loginCheck, indexRouter);
app.use("/accounting", loginCheck, (req, res, next) => {
    if(req.session.role !== "accountant")
        res.redirect("/");
    next();
}, accountingRouter);
app.use("/user", loginCheck, (req, res, next) => {
    if(req.session.role !== "user")
        res.redirect("/");
    next();
}, userRouter);

//Catch-All
app.use(function(req, res, next) {
    if (req.originalUrl === "/favicon.ico") {
        res.status(204);
    } else {
        next(createError(404, "The Requested Page Does Not Exist"));
    }
});

//Error Handling
//eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV === "development" ? err : {};

    res.status(err.status || 500);
    res.render("error", { title: "Error" });
});

function loginCheck(req, res, next) {
    if(req.session.username) {
        return next();
    } else {
        res.redirect("/login");
    }
}

module.exports = app;
