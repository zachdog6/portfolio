import React, {Component} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { withRouter } from "react-router-dom";

/**
 * Page that dispalys list of all employees.
 * Has options to edit, delete, and add.
 */
class List extends Component {
    constructor(props){
        super(props);

        this.state = {data:[]};

        this.displayEdit = this.displayEdit.bind(this);
        this.delete = this.delete.bind(this);
        this.displayPost = this.displayPost.bind(this);
        this.getData = this.getData.bind(this);
    }

    /**
     * validates prop inputs
     */
    static get propTypes() { 
        return {
            userId:PropTypes.number,
            resetUser:PropTypes.func,
            history:PropTypes.any
        };
    }

    render(){
        return(
            <div className="main">
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
                        {this.state.data.map(user => {
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
        );
    }

    /**
     * delets user, if not the current user
     * 
     * @param {*} id user to delete
     */
    delete(id){
        if(id === this.props.userId){
            toast.error("Can't Delete Yourself!");
        }
        else if (id !== "") {
            axios.delete("http://localhost:8080/api/employee/" + id).then(response => {
                toast.success(response.data);
                this.getData();
            }).catch(err => this.handleError(err));
        }
    }

    /**
     * gets list of all users to display
     */
    componentDidMount() {
        this.getData();
    }

    async getData(){
        axios.get("http://localhost:8080/api/employee").then(response => {
            this.setState({
                data:response.data
            });
        }).catch(err => this.handleError(err));
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
        this.props.history.push({
            pathname:"/put",
            state: {
                id:id,
                name:name,
                email:email,
                username:username
            }
        });
    }

    /**
     * shows page to add a user
     */
    displayPost(){
        this.props.history.push("/post");
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

export default withRouter(List);