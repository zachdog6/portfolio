
/**
 * Old, depricated queries
 * 
 * new, updated queries in sequalized queries
 */

require("dotenv").load();
var pg = require("pg");
var login = require("./login");

//would supply through .env, but doesn't play nice with pkg
var pool = new pg.Pool({
    connectionString: "postgres://rgcgvgol:ecx6vsGO1VgrFE4qHNdmQtEat7-FieHN@pellefant.db.elephantsql.com:5432/rgcgvgol"
});

function query(sql, values, cb) {
    pool.connect((err, client, done) => {
        if (err) {
            throw err;
        }
        client.query(sql, values, (err, result) => {
            done();
            cb(err, result);
        });
    });
}

module.exports.getAll = (res) => {
    query("SELECT * FROM EMP_DTL", [], (err, result) => {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send(result.rows);
        }
    });
};

module.exports.getById = (res, id) => {
    query("SELECT * FROM EMP_DTL WHERE id=$1", [id], (err, result) => {
        if (err) {
            res.status(400).send(err);
        }
        else if (result.rows.length === 0) {
            res.status(400).send("employee with id " + id + " does not exist");
        } else {
            res.status(200).send(result.rows[0]);
        }
    });
};

module.exports.idCheck = (res, id, cb) => {
    query("SELECT * FROM EMP_DTL WHERE id=$1", [id], (err, result) => {
        if (err) {
            res.status(400).send(err);
        }
        else if (result.rows.length === 0) {
            cb(false);
        } else {
            cb(true);
        }
    });
};

module.exports.post = (res, data) => {
    query("INSERT INTO EMP_DTL (name, email, username, password, salt) VALUES ($1, $2, $3, $4, $5)", data, (err) => {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send("Post Successful");
        }
    });
};

module.exports.put = (res, data, id) => {
    query("UPDATE EMP_DTL SET name=$1, email=$2, username=$3, password=$4, salt=$5 WHERE id=$6", data, (err, result) => {
        if (err) {
            res.status(400).send(err);
        } else {
            if (result.rowCount === 0) {
                res.status(400).send("employee with id " + id + " does not exist");
            }
            else {
                res.status(200).send("Put Successful");
            }
        }
    });
};

module.exports.delete = (res, id) => {
    query("DELETE FROM EMP_DTL WHERE id=$1", [id], (err, result) => {
        if (err) {
            res.status(400).send(err);
        } else {
            if (result.rowCount === 0) {
                res.status(400).send("employee with id " + id + " does not exist");
            }
            else {
                res.status(200).send("Delete Successful");
            }
        }
    });
};

module.exports.login = (res, username, password) => {
    query("SELECT * FROM EMP_DTL WHERE username=$1", [username], (err, result) => {
        if (err) {
            res.status(400).send(err);
        }
        else if (result.rows.length === 0) {
            res.status(400).send("employee with given username does not exist");
        } else {
            let pass = login.sha512(password, result.rows[0].salt);

            if(pass === result.rows[0].password){
                res.status(200).send("login successful");
            }
            else{
                res.status(400).send("employee with given username and password does not exist");
            }
        }
    });
};

module.exports.usernameCheck = (username, cb) => {
    query("SELECT * FROM EMP_DTL WHERE username=$1", [username], (err, result) => {
        if (err) {
            throw err;
        }
        else if (result.rows.length === 0) {
            cb(false);
        } else {
            cb(true);
        }
    });
};

module.exports.usernameCheckWithExp = (username, id, cb) => {
    query("SELECT * FROM EMP_DTL WHERE username=$1", [username], (err, result) => {
        if (err) {
            throw err;
        }
        else if (result.rows.length === 0) {
            cb(false);
        }
        else if((parseInt(result.rows[0].id) === parseInt(id)) && (result.rows.length === 1)){
            cb(false);
        } 
        else {
            cb(true);
        }
    });
};