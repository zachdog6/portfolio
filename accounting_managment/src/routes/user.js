var express = require("express");
var multer  = require("multer");
const AWS = require("aws-sdk");
var fs = require("fs");
const Sequelize = require("sequelize");
var createError = require("http-errors");

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

var multStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

var upload = multer({ storage: multStorage });

var router = express.Router();

router.get("/", (req, res) => {
    recordsDB.findAll({where:{user:req.session.username}}).then(records => {
        let recordDataValues = [];
        for(let record of records) {
            recordDataValues.push(record.dataValues);
        }
        res.render("user_home", {title:"User Home", records:recordDataValues});
    });
});

router.get("/delete/:id", (req, res, next) => {
    recordsDB.findOne({where:{id:req.params.id}}, { raw: true, }).then(record => {
        let images = record.images.split(";");

        let objects = [];
        for(let image of images) {
            objects.push({Key:image});
        }

        let params = {
            Bucket:"accounting-managment-images-ams",
            Delete:{Objects:objects},
        };

        let s3 = new AWS.S3();
        s3.deleteObjects(params, (err) => {
            if(err)
                res.render("user_home", {err:err, records:[]});
            else {
                recordsDB.destroy({where: {id:req.params.id}})
                    .then(res.redirect("/user"))
                    .catch(err => res.render("user_home", {err:err, records:[]}));
            }
        });
        
    }).catch(() => next(createError(500,"record with given id cannot be found")));
});

router.get("/view/:id", (req, res, next) => {
    recordsDB.findOne({where:{id:req.params.id}}, { raw: true, }).then(record => {
        let images = record.images.split(";");

        res.render("user_view_record", {title:"View Record", images:images, record:record});
    }).catch(() => next(createError(500,"record with given id cannot be found")));
});

router.get("/upload", (req, res) => {
    res.render("user_upload", {title:"Image Upload"});
});

router.post("/upload", upload.array("images"), (req, res) => {
    let s3 = new AWS.S3();

    var promises=[];
    let imagesString = "";
    
    for(let file of req.files) {
        var params = {
            Bucket: "accounting-managment-images-ams",
            Body : fs.createReadStream(file.path),
            Key : file.filename
        };

        imagesString += ";" + file.filename;
        promises.push(s3.upload(params).promise());
    }

    imagesString = imagesString.substring(1);
    let requestData = {
        images:imagesString, 
        status:"Under Review", 
        user:req.session.username,
        total: req.body.total
    };

    Promise.all(promises)
        .then(recordsDB.upsert(requestData))
        .then(() => {
            res.render("user_upload", {msg: "Upload Succeeded", title:"Image Upload"});
        }).catch((err) => {
            console.log(err);
            res.render("user_upload", {err:"File Upload Unsuccessful", title:"Image Upload"});
        });
});

module.exports = router;