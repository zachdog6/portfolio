import React, { Component } from 'react';

class Login extends Component {
    constructor(props){
        super(props);

        this.username = "";
        this.password = "";
        this.saveUsername = this.saveUsername.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.login = this.login.bind(this);
    }

    render () {
        return(
            <table className="login-table">
                <tr>
                    <td>Username:</td>
                    <td><input type="text" onChange={this.saveUsername} /></td>
                </tr>
                <tr>
                    <td>Password:</td>
                    <td><input type="text" onChange={this.savePassword}/></td>
                </tr>
                <tr>
                    <td><button onClick={this.login}>Login</button></td>
                    <td></td>
                </tr>
            </table>
        );
    }

    login(){
        this.props.login(this.username, this.password);
    }

    saveUsername(event){
        this.username = event.target.value;
    }

    savePassword(event){
        this.password = event.target.value;
    }
}

export default Login;