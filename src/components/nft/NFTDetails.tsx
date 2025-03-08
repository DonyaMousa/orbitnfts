import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import { NFT } from '../../types/nft';

interface NFTDetailsProps {
  nft: NFT;
  isOpen: boolean;
  onToggle: () => void;
}

export const NFTDetails: React.FC<NFTDetailsProps> = React.memo(({ nft, isOpen, onToggle }) => {
  return (
    <Card>
      <div className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <h3 className="text-lg font-semibold">Details</h3>
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
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Address</span>
                <a
                  href={`https://etherscan.io/address/${nft.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  {`${nft.contractAddress.slice(0, 6)}...${nft.contractAddress.slice(-4)}`}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token ID</span>
                <span>{nft.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token Standard</span>
                <span>{nft.tokenStandard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blockchain</span>
                <span>{nft.blockchain}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
});

NFTDetails.displayName = 'NFTDetails';