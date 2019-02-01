/**
 * Implements query functionality for postgress DB
 */

require("dotenv").load();
const Sequelize = require("sequelize");
var login = require("./login");

//would supply through .env, but doesn't play nice with pkg
const sequelize = new Sequelize("postgres://rgcgvgol:ecx6vsGO1VgrFE4qHNdmQtEat7-FieHN@pellefant.db.elephantsql.com:5432/rgcgvgol");

/**
 * Employee model
 * 
 * This needs to be in a local postgress DB named EMP_MASTER (connection string in .env)
 */
const EmployeeDB = sequelize.define("emp_dtl", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.TEXT },
    email: { type: Sequelize.TEXT },
    username: { type: Sequelize.TEXT },
    password: { type: Sequelize.TEXT },
    salt: { type: Sequelize.TEXT }
}, { timestamps: false, freezeTableName: true, });

//{ force: true }
EmployeeDB.sync();

module.exports.close = () => {
    sequelize.close();
};

/**
 * Queries the postgress DB. Name explains purpose for most.
 * 
 * @param {*} res res object to send data/confirmation to
 * @param {*} data data to post when appropriate
 * @param {*} id id of user inside database.
 */

module.exports.getAll = (res) => {
    EmployeeDB.findAll({ raw: true, }).then(employees => {
        res.status(200).send(employees);
    });
};

module.exports.getById = (res, id) => {
    EmployeeDB.findById(id, { raw: true, }).then(employee => {
        if (employee === null) {
            res.status(400).send("employee with id " + id + " does not exist");
        } else {
            res.status(200).send(employee);
        }
    });
};

/**
 * Used to check if employee with given id exists
 * 
 * @param {*} res 
 * @param {*} id id of employee
 * @param {*} cb function to call with result when query is complete
 */
module.exports.idCheck = (res, id, cb) => {
    EmployeeDB.findById(id, { raw: true, }).then(employee => {
        if (employee === null) {
            cb(false);
        } else {
            cb(true);
        }
    });
};

module.exports.post = (res, data) => {
    EmployeeDB.create(data).then(() => {
        res.status(200).send("Post Successful");
    });
};

module.exports.put = (res, data, id) => {
    EmployeeDB.update(data, { where: { id: id } }).then(employee => {
        if (employee === null) {
            res.status(400).send("employee with id " + id + " does not exist");
        }
        else {
            res.status(200).send("Put Successful");
        }
    });
};

module.exports.delete = (res, id) => {
    EmployeeDB.destroy({ where: { id: id } }).then(employee => {
        if ((employee === null) || (employee === 0)) {
            res.status(400).send("employee with id " + id + " does not exist");
        }
        else {
            res.status(200).send("Delete Successful");
        }
    });
};

/**
 * Checks if employee with given username and password exists
 * @param {*} res where to send results
 * @param {*} username username to check
 * @param {*} password password to check
 */
module.exports.login = (res, username, password) => {
    EmployeeDB.findOne({ where: { username: username } }, { raw: true, }).then(employee => {
        if (employee === null) {
            res.status(400).send("employee with given username does not exist");
        } else {
            let pass = login.sha512(password, employee.salt);

            if(pass === employee.password){
                res.status(200).send(employee);
            }
            else{
                res.status(400).send("employee with given username and password does not exist");
            }
        }
    });
};

/**
 * Checks if username is in use
 * @param {*} username username to check
 * @param {*} cb function to call with result
 */
module.exports.usernameCheck = (username, cb) => {
    EmployeeDB.findOne({ where: { username: username } }, { raw: true, }).then(employee => {
        if (employee === null) {
            cb(false);
        } else {
            cb(true);
        }
    });
};

/**
 * Checks if username is in use, with exception for the given id
 * 
 * @param {*} username username to check
 * @param {*} id id to ignore
 * @param {*} cb function to call with result
 */
module.exports.usernameCheckWithExp = (username, id, cb) => {
    EmployeeDB.findOne({ where: { username: username } }, { raw: true, }).then(employee => {
        if (employee === null) {
            cb(false);
        }
        else if(employee.id === parseInt(id)){
            cb(false);
        } 
        else {
            cb(true);
        }
    });
};