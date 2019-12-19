var express = require("express");
const AWS = require("aws-sdk");
var router = express.Router();

router.get("/", function(req, res) {
    if(req.session.role === "accountant") {
        res.redirect("/accounting");
    } else {
        res.redirect("/user");
    }
});


router.get("/image/:image", (req,res) => {
    var params = {
        Bucket: "accounting-managment-images-ams", 
        Key: req.params.image
    };
    
    let s3 = new AWS.S3();
    s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err);
            res.status(204);
        }
        else {
            res.writeHead(200, {"Content-Type": "image/jpeg"});
            res.write(data.Body, "binary");
            res.end(null, "binary");
        }
    });
});

module.exports = router;