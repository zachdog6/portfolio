const Sequelize = require("sequelize");
var passHash = require("./pass_hash");
var express = require("express");
var multer  = require("multer");

var router = express.Router();
var upload = multer();

const sequelize = new Sequelize("emp_dtl", "", "", {dialect: "sqlite"});

const EmployeeDB = sequelize.define("emp_dtl", {
    username: { type: Sequelize.TEXT, primaryKey: true },
    password: { type: Sequelize.TEXT },
    salt: { type: Sequelize.TEXT }
}, { timestamps: false, freezeTableName: true, });

EmployeeDB.sync();

router.get("/", (req, res) => {
    res.render("login");
});

router.post("/", upload.none(), (req, res) => {
    EmployeeDB.findOne({ where: { username: req.body.username } }, { raw: true, }).then(employee => {
        if (employee === null) {
            res.render("login", {err:"employee with given username does not exist"});
        } else {
            let pass = passHash.sha512(req.body.password, employee.salt);

            if(pass === employee.password){
                req.session.username = req.body.username;
                res.redirect("/");
            }
            else{
                res.render("login", {err:"employee with given username does not exist"});
            }
        }
    });
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", upload.none(), (req, res) => {

    let passwordData = passHash.newPassword(req.body.password);
    let userData = {username: req.body.username, password: passwordData.passwordHash, salt: passwordData.salt};

    EmployeeDB.upsert(userData).then(() => {
        req.session.username = req.body.username;
        res.redirect("/");
    });
});

module.exports = router;