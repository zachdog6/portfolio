import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

/**
 * Page to login users
 */
class Login extends Component {
    constructor(props){
        super(props);

        this.state = {username:"", password:""};

        this.saveUsername = this.saveUsername.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    /**
     * validates prop inputs
     */
    static get propTypes() { 
        return { 
            login:PropTypes.func,
            history:PropTypes.any
        }; 
    }

    render () {
        return(
            <form className="main" onSubmit={this.login}>
                <table className="login-table">
                    <tbody>
                        <tr>
                            <td>Username:</td>
                            <td><input type="text" onChange={this.saveUsername} value={this.state.username}/></td>
                        </tr>
                        <tr>
                            <td>Password:</td>
                            <td><input type="password" onChange={this.savePassword} value={this.state.password}/></td>
                        </tr>
                    </tbody>
                </table><br />
                <button type="submit">Login</button><button type="button" onClick={this.register}>Register</button>
            </form>
        );
    }

    login(event){
        event.preventDefault();
        this.props.login(this.state.username, this.state.password);
    }

    register(){
        this.props.history.push("/register");
    }

    saveUsername(event){
        this.setState({username:event.target.value});
    }

    savePassword(event){
        this.setState({password:event.target.value});
    }
}

export default withRouter(Login);