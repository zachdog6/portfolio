import React, { Component } from "react";
import PropTypes from "prop-types";

/**
 * Page to login or register users
 */
class Login extends Component {
    constructor(props){
        super(props);

        this.state = {login:true, username:"", password:"", name:"", email:""};

        this.saveUsername = this.saveUsername.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.saveEmail = this.saveEmail.bind(this);
        this.saveName = this.saveName.bind(this);
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    /**
     * validates prop inputs
     */
    static get propTypes() { 
        return { 
            login:PropTypes.func,
            register:PropTypes.func
        }; 
    }

    render () {
        if(this.state.login){
            return(
                <form className="main" onSubmit={this.login}>
                    <table className="login-table">
                        <tr>
                            <td>Username:</td>
                            <td><input type="text" onChange={this.saveUsername} value={this.state.username}/></td>
                        </tr>
                        <tr>
                            <td>Password:</td>
                            <td><input type="password" onChange={this.savePassword} value={this.state.password}/></td>
                        </tr>
                    </table><br />
                    <button type="submit">Login</button><button type="button" onClick={this.register}>Register</button>
                </form>
            );
        }
        else{
            return(
                <form className="main" onSubmit={this.register}>
                    <tr>
                        <td>Username:</td>
                        <td><input type="text" onChange={this.saveUsername} value={this.state.username}/></td>
                    </tr>
                    <tr>
                        <td>Password:</td>
                        <td><input type="password" onChange={this.savePassword} value={this.state.password}/></td>
                    </tr>
                    <tr>
                        <td>Name:</td>
                        <td><input type="text" onChange={this.saveName} value={this.state.name}/></td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td><input type="text" onChange={this.saveEmail} value={this.state.email}/></td>
                    </tr>
                    <tr>
                        <td><button type="submit">Register</button></td>
                        <td></td>
                    </tr>
                </form>
            );
        }
    }

    login(event){
        event.preventDefault();
        this.props.login(this.state.username, this.state.password);
    }

    register(event){
        if(this.state.login){
            this.setState({login:false});
        }
        else if((this.state.username !== "") && (this.state.email !== "") && (this.state.password !== "") && (this.state.name !== "")){
            event.preventDefault();
            this.props.register(this.state.username, this.state.password, this.state.email, this.state.name);
            this.setState({login:true});
        }
    }

    saveUsername(event){
        this.setState({username:event.target.value});
    }

    savePassword(event){
        this.setState({password:event.target.value});
    }
    saveEmail(event){
        this.setState({email:event.target.value});
    }
    saveName(event){
        this.setState({name:event.target.value});
    }
}

export default Login;