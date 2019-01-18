import React, { Component } from 'react';
import './App.css';
import Login from "./Login";
import axios from 'axios'
import Header from "./Header"

/**
 * Frontend for employee_details node server
 * 
 * Does basic login, post, put, delete with methods named accordingly
 */
class App extends Component {
  constructor(props) {
    super(props);

    this.state = { user: { id: "", name: "", email: "", username: "", password: "" }, inLogin: true, message: "",
                  id:"", putId:"", name:"", email:"", username:"", password:"", post:false, put:false};
    
    this.login = this.login.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.saveId = this.saveId.bind(this);
    this.displayPost = this.displayPost.bind(this);
    this.saveName = this.saveName.bind(this);
    this.saveEmail = this.saveEmail.bind(this);
    this.savePassword = this.savePassword.bind(this);
    this.saveUsername = this.saveUsername.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.savePutId= this.savePutId.bind(this);
    this.displayPut = this.displayPut.bind(this);
    this.delete = this.delete.bind(this);
    this.cancel = this.cancel.bind(this);
    this.logout = this.logout.bind(this);
    this.register = this.register.bind(this);
  }

  render() {
    if (this.state.inLogin){ //login page
      return (
        <div>
          <Header login={true}/>
          <Login login={this.login} register={this.register}/>
          {this.state.message}
        </div>
      );
    }
    else if(this.state.post){
      return(
        <div>
          <Header login={false} logout={this.logout}/>
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
          <Header login={false} logout={this.logout}/>
          <form className="main" onSubmit={this.put}>
            <input type="number" placeholder="Id" onChange={this.savePutId} value={this.state.putId}/><br />
            <input type="text" placeholder="Name" onChange={this.saveName} value={this.state.name}/><br />
            <input type="text" placeholder="Email" onChange={this.saveEmail} value={this.state.email}/><br />
            <input type="text" placeholder="Username" onChange={this.saveUsername} value={this.state.username}/><br />
            <input type="password" placeholder="Password" onChange={this.savePassword} value={this.state.password}/><br />
            <button type="submit">Put</button><button type="button" onClick={this.cancel}>Cancel</button>
          </form>
        </div>
      );
    }
    else { //main page where CRUD operations are called
      return (
        <div>
          <Header login={false} logout={this.logout}/>
          <div className="main">
            <h2>Hello {this.state.user.name}!</h2>
            <br />
            <form onSubmit={this.getOne}>
              <input type="number" placeholder="id" onChange={this.saveId} value={this.state.id}/><br />
              <button type="submit">Get</button> <button type="button" onClick={this.delete}>Delete</button>
            </form>
            <br />
            <button type="button" onClick={this.getAll}>Get All</button><button type="button" onClick={this.displayPost}>Post</button><button type="button" onClick={this.displayPut}>Put</button>
            <br />
            {this.state.message}
          </div>
        </div>
      );
    }
  }

  logout(){
    this.setState({user: { id: "", name: "", email: "", username: "", password: "" }, inLogin: true, message: "",
                  id:"", putId:"", name:"", email:"", username:"", password:"", post:false, put:false});
  }

  cancel(){
    this.setState({put:false, post:false});
  }

  delete(){
    if(this.state.id === this.state.user.id){
      this.setState({ message: <p className="error">Can't Delete Yourself!</p>});
    }
    else if (this.state.id !== "") {
      axios.delete('http://localhost:8080/api/employee/' + this.state.id).then(response => {
        this.setState({ message: <p className="result">{response.data}</p> });
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
    }
  }

  /**
   * Puts input boxes on page. Login performed by post method
   */
  displayPost() {
    this.setState({
      post:true
    });
  }

  /**
   * Puts input boxes on page. Login performed by put method
   */
  displayPut() {
    this.setState({
      put:true
    });
  }

  put(event){
    let go = true;

    if(event !== undefined)
      event.preventDefault();

    if ((this.state.username === "") || (this.state.email === "") || 
        (this.state.password === "") || (this.state.username === ""))
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
      
      let putId = this.state.putId;
      axios.put('http://localhost:8080/api/employee/' + this.state.putId, data).then(response => {
        this.setState({ message: <p className="result">{response.data}</p>, username:"", password:"", name:"", email:"", putId:"", put:false});
        if(putId === this.state.user.id){
          this.setState(prevState => ({user: { id: prevState.user.id, name: prevState.name, email: prevState.email, 
            username: prevState.username, password: prevState.password }}));
        }
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p>, username:"", 
          password:"", name:"", email:"", putId:"", put:false}) });
    }
  }

  register(username, password, email, name){
    let data = {
      user: {
        username: username,
        password: password,
        name: name,
        email: email
      }
    };

    axios.post('http://localhost:8080/api/employee', data).then(response => {
        this.setState({ message: <p className="result">{response.data}</p>});
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p>})});
  }

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

      axios.post('http://localhost:8080/api/employee', data).then(response => {
        this.setState({ message: <p className="result">{response.data}</p>, username:"", password:"", name:"", email:"", post:false});
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p>, username:"", password:"", name:"", email:"", post:false}) });
    }
  }


  savePutId(event){
    this.setState({putId:parseInt(event.target.value, 10)});
  }

  saveName(event) {
    this.setState({name:event.target.value});
  }

  saveEmail(event) {
    this.setState({email:event.target.value});
  }

  saveUsername(event) {
    this.setState({username:event.target.value});
  }

  savePassword(event) {
    this.setState({password:event.target.value});
  }

  /**
   * handles get by id
   */
  getOne(event) {
      if(event !== undefined)
        event.preventDefault();

      axios.get('http://localhost:8080/api/employee/' + this.state.id).then(response => {
        this.setState({
          message:
            <div className="result">
              <h3>Employee: {this.state.id}</h3>
              <p>
                Name: {response.data.name}, email: {response.data.email}
              </p>
            </div>
        });
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
  }

  saveId(event) {
    this.setState({id:parseInt(event.target.value, 10)});
  }

  getAll() {
    axios.get('http://localhost:8080/api/employee').then(response => {
      this.setState({
        message:
          <div className="result">
            <h3>Employee List</h3>
            {response.data.map(user => {
              return (
                <p>
                  Name: {user.name}, email: {user.email}, id: {user.id}
                </p>
              )
            })}
          </div>
      })
    })
  }

  /**
   * login logic for Login component
   * 
   * @param {*} username username of user to login
   * @param {*} password password of user to login
   */
  login(username, password) {let data = {
      user: {
        username: username,
        password: password
      }
    };

    axios.post('http://localhost:8080/api/employee/login', data).then(response => {
      this.setState({
        inLogin: false, user: { id: response.data.id, name: response.data.name, email: response.data.email, username: response.data.username, password: this.state.password }
      });
    }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
  }
}

export default App;
