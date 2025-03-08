import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { NFTActivity } from '../../types/nft';
import { formatDate } from '../../utils/date';
import { formatEther } from '../../utils/format';

interface NFTActivityListProps {
  activities: NFTActivity[];
  isOpen: boolean;
  onToggle: () => void;
}

export const NFTActivityList: React.FC<NFTActivityListProps> = React.memo(({ 
  activities, 
  isOpen, 
  onToggle 
}) => {
  return (
    <Card>
      <div className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <h3 className="text-lg font-semibold">Activity</h3>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-4"
            >
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{activity.type}</span>
                    <span>by {activity.user}</span>
                  </div>
                  <div className="text-right">
                    {activity.price && (
                      <div>{formatEther(activity.price)} ETH</div>
                    )}
                    <div className="text-sm text-gray-500">
                      {formatDate(activity.date)}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
});

NFTActivityList.displayName = 'NFTActivityList';