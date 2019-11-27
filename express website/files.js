var express = require("express");
var router = express.Router();
const fs = require("fs");
var multer  = require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "files/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
   
var upload = multer({ storage: storage });

router.get("/", (req, res) => {
    fs.readdir("./files", (err, files) => {
        let filesOnly = [];
        files.forEach(file => {
            let stats = fs.statSync("files/" + file);
            if(stats.isFile())
                filesOnly.push(file);
        });

        res.render("view_files", {files:filesOnly});
    });
});

router.get("/upload", (req, res) => {
    res.render("upload_file");
});

router.post("/upload", upload.single("file"), (req, res) => {
    console.log(req.file.originalname + " uploaded");
    res.redirect("/files");
});

router.get("/download/:file", (req, res) => {
    res.download("files/" + req.params.file);
});

module.exports = router;