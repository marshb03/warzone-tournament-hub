import React from 'react';
import Header from './Header';
import Footer from './Footer';

// src/components/layout/Layout.jsx
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white">
      <Header />
      <main className="flex-grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;