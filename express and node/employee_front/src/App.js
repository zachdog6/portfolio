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

    this.state = { user: { id: "", name: "", email: "", username: "", password: "" }, inLogin: true, message: "" }
    
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

    this.id = -1;
    this.putId = -1;
    this.name = "";
    this.email = "";
    this.username = "";
    this.password = "";
  }

  render() {
    if (this.state.inLogin) //login page
      return (
        <div>
          <Header />
          <Login login={this.login} />
          {this.state.message}
        </div>
      );
    else { //main page where CRUD operations are called
      return (
        <div className="main">
          <Header />
          <h2>Hello {this.state.user.name}!</h2>
          <br />
          <div className="buttons">
          <input type="number" placeholder="id" onChange={this.saveId} /><br />
            <button onClick={this.getOne}>Get</button> <button onClick={this.delete}>Delete</button><br />
            <br />
            <button onClick={this.getAll}>Get All</button><br />
            <button onClick={this.displayPost}>Post</button><br />
            <button onClick={this.displayPut}>Put</button>
          </div>
          <br />
          {this.state.message}
        </div>
      );
    }
  }

  delete(){
    if(this.id === this.state.user.id)
      this.setState({ message: <p className="error">Can't Delete Yourself!</p>});
    if (this.id > -1) {
      axios.delete('http://localhost:8080/api/employee/' + this.id).then(response => {
        this.setState({ message: <p className="result">{response.data}</p> });
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
    }
  }

  /**
   * Puts input boxes on page. Login performed by post method
   */
  displayPost() {
    this.setState({
      message:
        <div key="post">
          <input type="text" placeholder="Name" onChange={this.saveName} /><br />
          <input type="text" placeholder="Email" onChange={this.saveEmail} /><br />
          <input type="text" placeholder="Username" onChange={this.saveUsername} /><br />
          <input type="text" placeholder="Password" onChange={this.savePassword} /><br />
          <button onClick={this.post}>Post</button>
        </div>
    });
  }

  /**
   * Puts input boxes on page. Login performed by put method
   */
  displayPut() {
    this.setState({
      message:
        <div key="put">
          <input type="number" placeholder="Id" onChange={this.savePutId} /><br />
          <input type="text" placeholder="Name" onChange={this.saveName} /><br />
          <input type="text" placeholder="Email" onChange={this.saveEmail} /><br />
          <input type="text" placeholder="Username" onChange={this.saveUsername} /><br />
          <input type="text" placeholder="Password" onChange={this.savePassword} /><br />
          <button onClick={this.put}>Put</button>
        </div>
    });
  }

  put(){
    let go = true;

    if ((this.putId < 0) ||(this.username === "") || (this.email === "") || (this.password === "") || (this.username === ""))
      go = false;

    if (go) {
      let data = {
        user: {
          username: this.username,
          password: this.password,
          name: this.name,
          email: this.email
        }
      };

      axios.put('http://localhost:8080/api/employee/' + this.putId, data).then(response => {
        this.setState({ message: <p className="result">{response.data}</p> });
        if(this.putId === this.state.user.id){
          this.setState(prevState => ({user: { id: prevState.user.id, name: this.name, email: this.email, 
            username: this.username, password: this.password }}));
        }
        this.username = "";
        this.password = "";
        this.email = "";
        this.name = "";
        this.putId = -1;
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
    }
  }

  post() {

    let go = true;

    if ((this.username === "") || (this.email === "") || (this.password === "") || (this.username === ""))
      go = false;

    if (go) {
      let data = {
        user: {
          username: this.username,
          password: this.password,
          name: this.name,
          email: this.email
        }
      };

      axios.post('http://localhost:8080/api/employee', data).then(response => {
        this.setState({ message: <p className="result">{response.data}</p> });
        this.username = "";
        this.password = "";
        this.email = "";
        this.name = "";
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
    }
  }


  savePutId(event){
    this.putId = event.target.value;
  }

  saveName(event) {
    this.name = event.target.value;
  }

  saveEmail(event) {
    this.email = event.target.value;
  }

  saveUsername(event) {
    this.username = event.target.value;
  }

  savePassword(event) {
    this.password = event.target.value;
  }

  /**
   * handles get by id
   */
  getOne() {
    if (this.id > -1) {
      axios.get('http://localhost:8080/api/employee/' + this.id).then(response => {
        this.setState({
          message:
            <div>
              <h3>Employee: {this.id}</h3>
              <p>
                Name: {response.data.name}, email: {response.data.email}
              </p>
            </div>
        });
      }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
    }
  }

  saveId(event) {
    this.id = event.target.value;
  }

  getAll() {
    axios.get('http://localhost:8080/api/employee').then(response => {
      this.setState({
        message:
          <div>
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
  login(username, password) {
    this.setState(prevState => ({ user: { name: prevState.user.name, email: prevState.user.email, username: username, password: password } }));

    let data = {
      user: {
        username: username,
        password: password
      }
    };

    axios.post('http://localhost:8080/api/employee/login', data).then(response => {
      this.setState({
        inLogin: false, user: { id: response.data.id, name: response.data.name, email: response.data.email, username: response.data.username, password: password },
        message: ""
      });
    }).catch(err => { this.setState({ message: <p className="error">{err.response.data}</p> }) });
  }
}

export default App;
