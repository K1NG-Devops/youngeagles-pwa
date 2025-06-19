import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
    <Navbar />
    <main className="flex-grow w-full overflow-x-hidden">
      <Outlet />
      {/* {children} */}
    </main>
    <Footer />
  </div>
);

export default Layout;

