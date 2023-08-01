import React, { Fragment } from 'react';
import MainHeader from './MainHeader';

const Layout = (props) => {
    return (
        <Fragment>
            <MainHeader user={props.user} />
            <main>{props.children}</main>
        </Fragment>
    );
};

export default Layout;
