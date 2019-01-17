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
                  id:"", putId:"", name:"", email:"", username:"", password:"", post:false, put:false}
    
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
  }

  render() {
    if (this.state.inLogin){ //login page
      let data = {login:this.login, post:this.post, saveEmail:this.saveEmail, saveName:this.saveName, 
              savePassword:this.savePassword, saveUsername:this.saveUsername, username:this.state.username,
              password:this.state.password, name:this.state.name, email:this.state.email}
      return (
        <div>
          <Header />
          <Login data={data}/>
          {this.state.message}
        </div>
      );
    }
    else if(this.state.post){
      return(
        <div>
          <Header />
          <div className="main">
            <input type="text" placeholder="Name" onChange={this.saveName} value={this.state.name}/><br />
            <input type="text" placeholder="Email" onChange={this.saveEmail} value={this.state.email}/><br />
            <input type="text" placeholder="Username" onChange={this.saveUsername} value={this.state.username}/><br />
            <input type="text" placeholder="Password" onChange={this.savePassword} value={this.state.password}/><br />
            <button onClick={this.post}>Post</button><button onClick={this.cancel}>Cancel</button>
          </div>
        </div>
      );
    }
    else if(this.state.put){
      return(
        <div>
          <Header />
          <div className="main">
            <input type="number" placeholder="Id" onChange={this.savePutId} value={this.state.putId}/><br />
            <input type="text" placeholder="Name" onChange={this.saveName} value={this.state.name}/><br />
            <input type="text" placeholder="Email" onChange={this.saveEmail} value={this.state.email}/><br />
            <input type="text" placeholder="Username" onChange={this.saveUsername} value={this.state.username}/><br />
            <input type="text" placeholder="Password" onChange={this.savePassword} value={this.state.password}/><br />
            <button onClick={this.put}>Put</button><button onClick={this.cancel}>Cancel</button>
          </div>
        </div>
      );
    }
    else { //main page where CRUD operations are called
      return (
        <div>
          <Header />
          <div className="main">
            <h2>Hello {this.state.user.name}!</h2>
            <br />
            <input type="number" placeholder="id" onChange={this.saveId} value={this.state.id}/><br />
            <button onClick={this.getOne}>Get</button> <button onClick={this.delete}>Delete</button><br />
            <br />
            <button onClick={this.getAll}>Get All</button><button onClick={this.displayPost}>Post</button><button onClick={this.displayPut}>Put</button>
            <br />
            {this.state.message}
          </div>
        </div>
      );
    }
  }

  cancel(){
    this.setState({put:false, post:false});
  }

  delete(){
    if(this.state.id === this.state.user.id)
      this.setState({ message: <p className="error">Can't Delete Yourself!</p>});
    if (this.state.id > -1) {
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

  put(){
    let go = true;

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

  post() {

    let go = true;

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
    this.setState({putId:event.target.value});
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
  getOne() {
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
    this.setState({id:event.target.value});
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
  login() {let data = {
      user: {
        username: this.state.username,
        password: this.state.password
      }
    };

    axios.post('http://localhost:8080/api/employee/login', data).then(response => {
      this.setState({
        inLogin: false, user: { id: response.data.id, name: response.data.name, email: response.data.email, username: response.data.username, password: this.state.password },
        message: "", username:"", password:"", name:"", email:""
      });
    }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
  }
}

export default App;
