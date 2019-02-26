import React, {Component} from "react";
import Login from "./pages/login/Login";
import axios from "axios";
import List from "./pages/list/List";
import Home from "./pages/home/Home";
import Register from "./pages/register/Register";
import Header from "./components/header/Header";
import ProtectedRoute from "./ProtectedRoute";
import Put from "./pages/put/Put";
import Post from "./pages/post/Post";
import { Route, Switch, withRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import PropTypes from "prop-types";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

/**
 * Frontend for employee_details node server
 * 
 * Does basic login, post, put, delete with methods named accordingly
 */
class App extends Component {
    constructor(props) {
        super(props);

        this.state = { user: { id: "", name: "", email: "", username: "", password: "" }, inLogin: true};
    
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.register = this.register.bind(this);
        this.resetUser = this.resetUser.bind(this);
    }

    static get propTypes(){
        return({
            history:PropTypes.any
        });
    }

    render() {
        return(
            <div>
                <Header login={this.state.inLogin} logout={this.logout}/>
                <Switch>
                    <Route path="/register" component={() => <Register register={this.register} />} />
                    <Route path="/login" render={() => <Login login={this.login}/>} />
                    <ProtectedRoute path="/list" inLogin={this.state.inLogin} component={() => <List userId={this.state.user.id} resetUser={this.resetUser}/>}/>
                    <ProtectedRoute path="/home" inLogin={this.state.inLogin} component={() => <Home name={this.state.user.name} />} />
                    <ProtectedRoute path="/put" inLogin={this.state.inLogin} component={() => <Put resetUser={this.resetUser} userId={this.state.user.id} />} />
                    <ProtectedRoute path="/post" inLogin={this.state.inLogin} component={() => <Post />} />
                    <ProtectedRoute path="/*" inLogin={this.state.inLogin} component={() => <Home name={this.state.user.name} />} />
                </Switch>
                <ToastContainer />
            </div>
        );
    }

    /**
     * Gets user details again, incase details were changed in list page
     */
    resetUser(){
        axios.get("http://localhost:8080/api/employee/" + this.state.user.id).then(response => {
            this.setState({user: { id: response.data.id, name: response.data.name, email: response.data.email, username: response.data.username, password: response.data.password}});
        }).catch(err => this.handleError(err));
    }

    /**
     * Goes back to login component. Resets saved user details.
     */
    logout(){
        this.setState({ user: { id: "", name: "", email: "", username: "", password: "" }, inLogin: true, message:""});
        toast.success("Logout Sucessfull");
        this.props.history.push("/login");
    }

    /**
     * Creates new user.
     * For register page in login component
     * 
     * @param {*} username username of new user
     * @param {*} password password of new user
     * @param {*} email email of new user
     * @param {*} name name of new user
     */
    register(username, password, email, name){
        let data = {
            user: {
                username: username,
                password: password,
                name: name,
                email: email
            }
        };

        axios.post("http://localhost:8080/api/employee", data).then(response => {
            toast.success(response.data);
            this.props.history.push("/login");
        }).catch(err => this.handleError(err));
    }

    /**
   * Login logic for Login component
   * 
   * @param {*} username username of user to login
   * @param {*} password password of user to login
   */
    login(username, password) {
        let data = {
            user: {
                username: username,
                password: password
            }
        };

        axios.post("http://localhost:8080/api/employee/login", data).then(response => {
            toast.success("login successful");
            this.setState({
                inLogin: false, user: { id: response.data.id, name: response.data.name, email: response.data.email, username: response.data.username, password: this.state.password }
            });
            this.props.history.push("/home");
        }).catch(err => this.handleError(err));
    }

    /**
     * print error to toast container
     * @param {*} err error to print
     */
    handleError(err){
        if (err.response) {
            toast.error(err.response.data);
        } else if (err.request) {
            toast.error(err.request);
        } else {
            toast.error(err.message);
        }
    }
}

export default withRouter(App);
