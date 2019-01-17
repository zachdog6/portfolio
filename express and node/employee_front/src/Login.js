import React, { Component } from 'react';

class Login extends Component {
    constructor(props){
        super(props);

        this.state = {login:true}

        this.saveUsername = this.saveUsername.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.saveEmail = this.saveEmail.bind(this);
        this.saveName = this.saveName.bind(this);
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    render () {
        if(this.state.login){
            return(
                <div className="main">
                    <table className="login-table">
                        <tr>
                            <td>Username:</td>
                            <td><input type="text" onChange={this.saveUsername} value={this.props.data.username}/></td>
                        </tr>
                        <tr>
                            <td>Password:</td>
                            <td><input type="text" onChange={this.savePassword} value={this.props.data.password}/></td>
                        </tr>
                    </table><br />
                    <button onClick={this.login}>Login</button><button onClick={this.register}>Register</button>
                </div>
            );
        }
        else{
            return(
                <table className="login-table">
                    <tr>
                        <td>Username:</td>
                        <td><input type="text" onChange={this.saveUsername} value={this.props.data.username}/></td>
                    </tr>
                    <tr>
                        <td>Password:</td>
                        <td><input type="text" onChange={this.savePassword} value={this.props.data.password}/></td>
                    </tr>
                    <tr>
                        <td>Name:</td>
                        <td><input type="text" onChange={this.saveName} value={this.props.data.name}/></td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td><input type="text" onChange={this.saveEmail} value={this.props.data.email}/></td>
                    </tr>
                    <tr>
                        <td><button onClick={this.register}>Register</button></td>
                        <td></td>
                    </tr>
                </table>
            );
        }
    }

    login(){
        this.props.data.login();
    }

    register(){
        if(this.state.login){
            this.setState({login:false});
        }
        else if((this.username !== "") && (this.email !== "") && (this.password !== "") && (this.name !== "")){
            this.props.data.post();
            this.setState({login:true})
        }
    }

    saveUsername(event){
        this.props.data.saveUsername(event);
    }

    savePassword(event){
        this.props.data.savePassword(event);
    }
    saveEmail(event){
        this.props.data.saveEmail(event);
    }
    saveName(event){
        this.props.data.saveName(event);
    }
}

export default Login;