import { Fragment } from 'react';
import type { ReactNode } from 'react';
import MainHeader from './MainHeader';

interface LayoutProps {
    children: ReactNode;
}

const Layout = (props: LayoutProps) => {
    return (
        <Fragment>
            <MainHeader />
            <main>{props.children}</main>
        </Fragment>
    );
};

export default Layout;
