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
                <form className="main" onSubmit={this.login}>
                    <table className="login-table">
                        <tr>
                            <td>Username:</td>
                            <td><input type="text" onChange={this.saveUsername} value={this.props.data.username}/></td>
                        </tr>
                        <tr>
                            <td>Password:</td>
                            <td><input type="password" onChange={this.savePassword} value={this.props.data.password}/></td>
                        </tr>
                    </table><br />
                    <button type="submit">Login</button><button onClick={this.register}>Register</button>
                </form>
            );
        }
        else{
            return(
                <form className="main" onSubmit={this.register}>
                    <tr>
                        <td>Username:</td>
                        <td><input type="text" onChange={this.saveUsername} value={this.props.data.username}/></td>
                    </tr>
                    <tr>
                        <td>Password:</td>
                        <td><input type="password" onChange={this.savePassword} value={this.props.data.password}/></td>
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
                        <td><button type="submit">Register</button></td>
                        <td></td>
                    </tr>
                </form>
            );
        }
    }

    login(event){
        event.preventDefault()
        this.props.data.login();
    }

    register(event){
        if(this.state.login){
            this.setState({login:false});
        }
        else if((this.username !== "") && (this.email !== "") && (this.password !== "") && (this.name !== "")){
            event.preventDefault()
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