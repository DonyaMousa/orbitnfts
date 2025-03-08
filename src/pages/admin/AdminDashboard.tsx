import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import Card from '../../components/ui/Card';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold mt-1">156.84 ETH</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold mt-1">3,245</p>
              </div>
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                <Users className="h-6 w-6 text-secondary-500" />
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total NFTs</p>
                <p className="text-2xl font-bold mt-1">10,876</p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-accent-500" />
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trading Volume</p>
                <p className="text-2xl font-bold mt-1">1,245.32 ETH</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;