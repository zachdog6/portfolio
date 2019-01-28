import React, {Component} from "react";
import axios from "axios";
import PropTypes from "prop-types";

/**
 * Page that dispalys list of all employees.
 * Has options to edit, delete, and add.
 */
class List extends Component {
    constructor(props){
        super(props);

        this.state = {message:"", backend_message:"", put:false, post:false, id:"", name:"", username:"", email:"", password:""};

        this.displayEdit = this.displayEdit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.saveEmail = this.saveEmail.bind(this);
        this.saveId = this.saveId.bind(this);
        this.saveName = this.saveName.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.saveUsername = this.saveUsername.bind(this);
        this.put = this.put.bind(this);
        this.getAll = this.getAll.bind(this);
        this.delete = this.delete.bind(this);
        this.displayPost = this.displayPost.bind(this);
        this.post = this.post.bind(this);
    }

    /**
     * validates prop inputs
     */
    static get propTypes() { 
        return {
            userId:PropTypes.number,
            resetUser:PropTypes.func
        };
    }

    render(){
        if(this.state.post){
            return(
                <div>
                    <form className="main" onSubmit={this.post}>
                        <input type="text" placeholder="Name" onChange={this.saveName} value={this.state.name}/><br />
                        <input type="text" placeholder="Email" onChange={this.saveEmail} value={this.state.email}/><br />
                        <input type="text" placeholder="Username" onChange={this.saveUsername} value={this.state.username}/><br />
                        <input type="password" placeholder="Password" onChange={this.savePassword} value={this.state.password}/><br />
                        <button type="submit">Post</button><button type="button" onClick={this.cancel}>Cancel</button>
                    </form>
                </div>
            );
        }
        else if(this.state.put){
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
        else{
            this.getAll();
            return(
                <div>
                    {this.state.message}
                    {this.state.backend_message}
                </div>
            );
        }
    }

    /**
     * Goes back to employee list, if in post or put pages
     */
    cancel(){
        this.getAll(this);
        this.setState({put:false, post:false, backend_message:"", id:"", name:"", username:"", email:"", password:""});
    }

    /**
     * delets user, if not the current user
     * 
     * @param {*} id user to delete
     */
    delete(id){
        if(id === this.props.userId){
            this.setState({ backend_message:<p className="error">Can&apos;t Delete Yourself!</p>});
        }
        else if (id !== "") {
            axios.delete("http://localhost:8080/api/employee/" + id).then(response => {
                this.setState({ backend_message: <p className="result">{response.data}</p> });
                this.getAll();
            }).catch(err => { this.setState({ backend_message: <p className="error">{err.response.data}</p> }); });
        }
    }

    /**
     * Adds new user
     * 
     * @param {*} event automatically sent by form
     */
    post(event) {

        let go = true;

        if(event !== undefined)
            event.preventDefault();

        if ((this.state.username === "") || (this.state.email === "") || (this.state.password === "") || (this.state.name === ""))
            go = false;

        if (go) {
            let data = {
                user: {
                    username: this.state.username,
                    password: this.state.password,
                    name: this.state.name,
                    email: this.state.email
                }
            };

            axios.post("http://localhost:8080/api/employee", data).then(response => {
                this.setState({ backend_message: <p className="result">{response.data}</p>, put:false, post:false, id:"", name:"", username:"", email:"", password:""});
            }).catch(err => { this.setState({ backend_message: <p className="error">{err.response.data}</p>, put:false, post:false, id:"", name:"", username:"", email:"", password:""}); });
        }
    }

    /**
     * Changes current user
     * 
     * @param {*} event automatically sent by form
     */
    put(event){
        let go = true;

        if(event !== undefined)
            event.preventDefault();

        if ((this.state.username === "") || (this.state.email === "") || 
        (this.state.password === "") || (this.state.username === "") || (this.state.id === ""))
            go = false;

        if (go) {
            let data = {
                user: {
                    username: this.state.username,
                    password: this.state.password,
                    name: this.state.name,
                    email: this.state.email
                }
            };
      
            let putId = this.state.id;
            axios.put("http://localhost:8080/api/employee/" + this.state.id, data).then(response => {
                this.setState({ backend_message: <p className="result">{response.data}</p>, put:false, post:false, id:"", name:"", username:"", email:"", password:""});
                if(putId === this.props.userId){
                    this.props.resetUser();
                }
            }).catch(err => { this.setState({ backend_message: <p className="error">{err.response.data}</p>, put:false, post:false, id:"", name:"", username:"", email:"", password:""}); });
        }
    }

    /**
     * gets list of all users to display
     */
    getAll() {
        axios.get("http://localhost:8080/api/employee").then(response => {
            this.setState({
                message:
                <div className="result">
                    <h3>Employee List</h3>
                    <table id="employee-table">
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td>Email</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            {response.data.map(user => {
                                return (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td><button onClick={() => this.displayEdit(user.id, user.name, user.email, user.username)}>Edit</button></td>
                                        <td><button onClick={() => this.delete(user.id)}>Delete</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <button onClick={this.displayPost}>Add</button>
                </div>
            });
        });
    }

    /**
     * shows page to edit a user
     * 
     * @param {*} id id of user to edit
     * @param {*} name name of user to edit
     * @param {*} email email of user to edit
     * @param {*} username username of user to edit
     */
    displayEdit(id, name, email, username){
        if(this.state.put){
            this.setState({put:false});
        }
        else{
            this.setState({put:true, id:id, name:name, username:username, email:email});
        }
    }

    /**
     * shows page to add a user
     */
    displayPost(){
        if(this.state.post){
            this.setState({post:false});
        }
        else{
            this.setState({post:true});
        }
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

    saveId(event){
        this.setState({id:parseInt(event.target.value, 10)});
    }
}

export default List;