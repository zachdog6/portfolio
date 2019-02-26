import React, { Component } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { withRouter } from "react-router-dom";

/**
 * page to register new user
 */
class Register extends Component {

    constructor(props){
        super(props);

        this.state = {username:"", password:"", name:"", email:""};

        this.saveUsername = this.saveUsername.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.saveEmail = this.saveEmail.bind(this);
        this.saveName = this.saveName.bind(this);
        this.register = this.register.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    static get propTypes() { 
        return {
            register:PropTypes.func,
            history:PropTypes.any
        }; 
    }
	
    render(){
        return(
            <form className="main" onSubmit={this.register}>
                <table>
                    <tbody>
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
                            <td><button onClick={this.cancel} type="button">Cancel</button></td>
                        </tr>
                    </tbody>
                </table>
            </form>
        );
    }
	
    register(event){
        if((this.state.username !== "") && (this.state.email !== "") && (this.state.password !== "") && (this.state.name !== "")){
            event.preventDefault();
            this.props.register(this.state.username, this.state.password, this.state.email, this.state.name);
        }
        else{
            event.preventDefault();
            toast.error("please fill out the entire form");
        }
    }

    cancel(){
        this.props.history.push("/login");
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

export default withRouter(Register);