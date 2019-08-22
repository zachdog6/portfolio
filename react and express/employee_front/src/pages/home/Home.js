import React, {Component} from "react";
import PropTypes from "prop-types";

/**
 * Default page. For now it just says hi.
 */
class Home extends Component {

    static get propTypes() { 
        return {
            name:PropTypes.string
        };
    }

    render(){
        return(
            <div className="main">
                <h2>Hello {this.props.name}!</h2>
            </div>
        );
    }
}
export default Home;