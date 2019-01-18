import React, { Component } from 'react';

class Header extends Component {
    constructor(props){
        super(props);

        this.logout = this.logout.bind(this);
    }    
    render () {
        if(this.props.login){
            return(
                <div className="header">
                    <h1>Employee Application</h1>
                </div>
            );
        }
        else{
            return(
                <div className="header">
                    <h1>Employee Application</h1>
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