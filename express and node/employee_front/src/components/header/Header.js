import  React, {Component} from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

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
    }

    static get propTypes() { 
        return { 
            login:PropTypes.bool,
            logout:PropTypes.func
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
                    <Link to="/home" className="header-button">Home</Link> |
                    <Link to="/list" className="header-button">Employee List</Link>
                    <h1 id="title">Employee Application</h1>
                    <button id="logout" onClick={this.logout}>LogOut</button>
                </div>
            );
        }
    }

    logout(){
        this.props.logout();
    }
}

export default Header;