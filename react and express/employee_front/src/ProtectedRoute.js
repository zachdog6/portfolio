import React from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";

/**
 * wrapper to check if user is logged in before routing appropriatly
 */
function ProtectedRoute ({component, inLogin, ...rest}) {
    return (
        <Route
            {...rest}
            render={() => inLogin === true
                ? <Redirect to="/login" />
                : component()}
        />
    );
}

ProtectedRoute.propTypes = {component:PropTypes.func, inLogin:PropTypes.bool};

export default ProtectedRoute;