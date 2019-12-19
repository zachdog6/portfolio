var express = require("express");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const AWS = require("aws-sdk");
var router = express.Router();

const poolData = {    
    UserPoolId : "us-east-1_yUrdU1uC6",  
    ClientId : "2f1hfs2q6rq2u5skskbaf1gddi"
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

router.get("/", function(req, res) {
    res.render("login");
});

router.post("/", (req, res) => {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username : req.body.email,
        Password : req.body.password,
    });

    var userData = {
        Username : req.body.email,
        Pool : userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {

            req.session.username = req.body.email;
            
            let idToken = result.getIdToken().getJwtToken();

            getRole(cognitoUser)
                .then(role => {
                    req.session.role = role;
                    setupAWS(idToken);
                    res.redirect("/");
                }).catch(err => res.render("login", {err:err}));
        },
        onFailure: function(err) {
            if (err.code === "UserNotConfirmedException") {
                res.redirect("/login/auth/" + req.body.email);
            } else if (err.code === "NotAuthorizedException") {
                res.render("login", {err:"Wrong Password"});
            } else if (err.code === "UserNotFoundException") {
                res.render("login", {err:"User Does not Exist"});
            } else {
                console.log(err);
                res.render("login", {err:"Login Failed"});
            }
        },

    });
});

router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", (req, res) => {
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:req.body.email}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:role",Value:req.body.role}));

    userPool.signUp(req.body.email, req.body.password, attributeList, null, (err) => {
        if (err) {
            if(err.code === "UsernameExistsException") {
                res.render("register", {err:"User Already Exists"});
            } else {
                console.log(err);
                res.render("register", {err:"Registration Failed"});
            }
        } else {
            res.redirect("/login/auth/" + req.body.email + "/" + req.body.role);
        }
    });
});

router.get("/auth/:username/:role", function(req, res) {
    res.render("auth", {username:req.params.username, role:req.params.role});
});

router.post("/auth/:username/:role", (req, res) => {
    var userData = {
        Username: req.params.username,
        Pool: userPool,
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmRegistration(req.body.code, true, (err) => {
        if (err) {
            console.log(err);
            res.render("auth", {err:"Authorization Failed", username:req.params.username});
        } else {
            req.session.username = req.params.username;
            req.session.role = req.params.role;
            res.redirect("/");
        }
    });
});

router.get("/logout", (req, res) => {
    delete req.session.username;
    delete req.session.role;
    res.redirect("/login");
});

function getRole(cognitoUser) {
    return new Promise((resolve, reject) => {
        cognitoUser.getUserAttributes(function(err, result) {
            if (err) {
                reject("Could Not Get User Data");
            }
            for (let i = 0; i < result.length; i++) {
                if(result[i].getName() === "custom:role") {
                    resolve(result[i].getValue());
                }
            }
            reject("User Attributes Not Found");
        });
    });
}

function setupAWS(idToken) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: "us-east-1:b30a2888-643b-43d6-a4a8-c04711e801e1",
        Logins: {
            "cognito-idp.us-east-1.amazonaws.com/us-east-1_yUrdU1uC6": idToken,
        },
    });
    AWS.config.update({region:"us-east-1"});

    AWS.config.credentials.refresh(error => {
        if (error)
            console.error(error);
    });
}

module.exports = router;