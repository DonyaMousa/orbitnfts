import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const AdminNFTs: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage NFTs</h1>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          Add New NFT
        </Button>
      </div>
      
      <Card className="p-6 mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Search NFTs..."
            leftIcon={<Search className="h-4 w-4" />}
            className="flex-1"
          />
          <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
            Filters
          </Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No NFTs found
        </p>
      </Card>
    </div>
  );
};

export default AdminNFTs;