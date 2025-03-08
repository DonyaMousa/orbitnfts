import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Orbit, LayoutDashboard, Image, Users, Settings, LogOut } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

// Mock admin addresses for demo purposes
const ADMIN_ADDRESSES = ['0x1234...5678', '0x8765...4321'];

const AdminLayout: React.FC = () => {
  const { account, isConnected } = useWallet();
  const location = useLocation();
  
  // Check if current user is an admin
  const isAdmin = isConnected && account && ADMIN_ADDRESSES.includes(account);
  
  // If not admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, name: 'Dashboard', path: '/admin' },
    { icon: <Image className="h-5 w-5" />, name: 'NFTs', path: '/admin/nfts' },
    { icon: <Users className="h-5 w-5" />, name: 'Users', path: '/admin/users' },
    { icon: <Settings className="h-5 w-5" />, name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark-400">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-300 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-dark-200">
          <Link to="/" className="flex items-center space-x-2">
            <Orbit className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-display font-bold gradient-text">OrbitNFTs</span>
          </Link>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-dark-200">
            <Link
              to="/"
              className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Exit Admin</span>
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-dark-300 shadow-sm p-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
        </header>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;