var express = require("express");
const Sequelize = require("sequelize");
var createError = require("http-errors");
var router = express.Router();

const sequelize = new Sequelize("emp_dtl", "", "", {dialect: "sqlite", storage: "./database.sqlite"});

const recordsDB = sequelize.define("records", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    images:Sequelize.TEXT,
    status:Sequelize.TEXT,
    user:Sequelize.TEXT,
    validator:Sequelize.TEXT,
    total:Sequelize.NUMBER
}, { timestamps: false, freezeTableName: true, });

recordsDB.sync();

router.get("/", (req, res) => {
    recordsDB.findAll().then(records => {
        let recordDataValues = [];
        for(let record of records) {
            recordDataValues.push(record.dataValues);
        }
        res.render("accounting_home", {title:"Accounting Home", records:recordDataValues});
    });
});

router.get("/view/:id", (req, res, next) => {
    recordsDB.findOne({where:{id:req.params.id}}, { raw: true, }).then(record => {
        let images = record.images.split(";");

        res.render("accounting_view_record", {title:"View Record", images:images, record:record});
    }).catch(() => next(createError(500,"record with given id cannot be found")));
});

router.get("/approve/:id", (req,res,next) => {
    recordsDB.update({validator:req.session.username, status:"Approved"}, {where:{id:req.params.id}})
        .then(() => {
            res.redirect("/accounting/view/" + req.params.id);
        }).catch(() => next(createError(500,"unable to approve")));
});

router.get("/reject/:id", (req,res,next) => {
    recordsDB.update({validator:req.session.username, status:"Rejected"}, {where:{id:req.params.id}})
        .then(() => {
            res.redirect("/accounting/view/" + req.params.id);
        }).catch(() => next(createError(500,"unable to reject")));
});

module.exports = router;