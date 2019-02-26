import React, {Component} from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * handles requests to update employee.
 */
class Put extends Component {

    static get propTypes() {
        return({
            resetUser:PropTypes.func,
            userId:PropTypes.number,
            location:PropTypes.object,
            history:PropTypes.any
        });
    }

    constructor(props){
        super(props);
		
        this.state = {
            name:this.props.location.state.name, email:this.props.location.state.email, 
            username:this.props.location.state.username, password:""
        };

        this.put = this.put.bind(this);
        this.saveName = this.saveName.bind(this);
        this.saveEmail = this.saveEmail.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.saveUsername = this.saveUsername.bind(this);
        this.cancel = this.cancel.bind(this);
    }
	
    render(){
        return(
            <div>
                <form className="main" onSubmit={this.put}>
                    <input type="text" placeholder="Name" onChange={this.saveName} value={this.state.name}/><br />
                    <input type="text" placeholder="Email" onChange={this.saveEmail} value={this.state.email}/><br />
                    <input type="text" placeholder="Username" onChange={this.saveUsername} value={this.state.username}/><br />
                    <input type="password" placeholder="Password" onChange={this.savePassword} value={this.state.password}/><br />
                    <button type="submit">Put</button><button type="button" onClick={this.cancel}>Cancel</button>
                </form>
            </div>
        );
    }
	
    put(event){
        let go = true;

        if(event !== undefined)
            event.preventDefault();

        if ((this.state.username === "") || (this.state.email === "") || 
        (this.state.password === "") || (this.state.username === ""))
            go = false;
			
        if(go){
            let data = {
                user: {
                    username: this.state.username,
                    password: this.state.password,
                    name: this.state.name,
                    email: this.state.email
                }
            };
	
            axios.put("http://localhost:8080/api/employee/" + this.props.location.state.id, data).then(response => {
                toast.info(response.data);
                if(this.props.location.state.id === this.props.userId){
                    this.props.resetUser();
                }
                this.props.history.push("/list");
            }).catch(err => {
                toast.error(err.response.data);
            });
        }
    }
	
    cancel(){
        this.props.history.push("/list");
    }
	
    saveName(event){
        this.setState({name:event.target.value});
    }

    saveEmail(event){
        this.setState({email:event.target.value});
    }

    saveUsername(event){
        this.setState({username:event.target.value});
    }

    savePassword(event){
        this.setState({password:event.target.value});
    }
}

export default withRouter(Put);