import React, {Component} from "react";
import "./App.css";
import Login from "./Login";
import axios from "axios";
import Header from "./Header";
import List from "./List";

/**
 * Frontend for employee_details node server
 * 
 * Does basic login, post, put, delete with methods named accordingly
 */
class App extends Component {
    constructor(props) {
        super(props);

        let key = "List" + Math.floor(Math.random() * 100);
        this.state = { user: { id: "", name: "", email: "", username: "", password: "" }, inLogin: true, list:false, listKey:key};
    
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.register = this.register.bind(this);
        this.displayList = this.displayList.bind(this);
        this.resetUser = this.resetUser.bind(this);
        this.home = this.home.bind(this);
    }

    render() {
        if (this.state.inLogin){
            return (
                <div>
                    <Header login={true}/>
                    <Login login={this.login} register={this.register}/>
                    {this.state.message}
                </div>
            );
        }
        else if(this.state.list){
            return(
                <div key={this.state.listKey}>
                    <Header home={this.home} login={false} logout={this.logout} list={this.displayList}/>
                    <List userId={this.state.user.id} resetUser={this.resetUser}/>
                </div>
            );
        }
        else {
            return (
                <div>
                    <Header home={this.home} login={false} logout={this.logout} list={this.displayList}/>
                    <div className="main">
                        <h2>Hello {this.state.user.name}!</h2>
                    </div>
                </div>
            );
        }
    }

    /**
     * goes back to hello screen
     */
    home(){
        this.setState({inLogin: false, list:false});
    }

    /**
     * Gets user details again, incase details were changed in list page
     */
    resetUser(){
        axios.get("http://localhost:8080/api/employee/" + this.state.user.id).then(response => {
            this.setState({user: { id: response.data.id, name: response.data.name, email: response.data.email, username: response.data.username, password: response.data.password}});
        }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }); });
    }

    /**
     * goes to list page
     */
    displayList(){
        let key = "List" + Math.floor(Math.random() * 100);
        this.setState({list:true, listKey:key});
    }

    /**
     * Goes back to login component. Resets saved user details.
     */
    logout(){
        this.setState({ user: { id: "", name: "", email: "", username: "", password: "" }, inLogin: true, list:false});
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
            this.setState({ message: <p className="result">{response.data}</p>});
        }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p>});});
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
            this.setState({
                inLogin: false, user: { id: response.data.id, name: response.data.name, email: response.data.email, username: response.data.username, password: this.state.password }
            });
        }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }); });
    }
}

export default App;
