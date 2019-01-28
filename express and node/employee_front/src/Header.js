import  React, {Component} from "react";
import PropTypes from "prop-types";

/**
 * Page header
 * 
 * Routing to login page and list of employees.
 * Has logout button.
 */
class Header extends Component {
    constructor(props){
        super(props);

        this.logout = this.logout.bind(this);
        this.list = this.list.bind(this);
        this.home = this.home.bind(this);
    }

    static get propTypes() { 
        return { 
            login:PropTypes.bool,
            list:PropTypes.func,
            logout:PropTypes.func,
            home:PropTypes.func
        }; 
    }
  
    render () {
        if(this.props.login){
            return(
                <div className="header">
                    <h1 id="title">Employee Application</h1>
                </div>
            );
        }
        else{
            return(
                <div className="header">
                    <button onClick={this.home} className="header-button">Home</button> |
                    <button onClick={this.list} className="header-button">Employee List</button>
                    <h1 id="title">Employee Application</h1>
                    <button id="logout" onClick={this.logout}>LogOut</button>
                </div>
            );
        }
    }

    list(){
        this.props.list();
    }

    logout(){
        this.props.logout();
    }

    home(){
        this.props.home();
    }
}

export default Header;