import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../../styles/dashboard.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header onMenuToggle={handleMenuToggle} isSidebarOpen={isSidebarOpen} />
      
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      
      {/* Main Content Area */}
      <main className="transition-all duration-300 ease-in-out lg:ml-64 pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-green-50/20">
        <div className="px-4 sm:px-6 lg:px-8 py-6 animate-fade-in-up">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
        
        {/* Footer inside main content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <Footer />
          </div>
        </div>
      </main>
      
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default DashboardLayout;