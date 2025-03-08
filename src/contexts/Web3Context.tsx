import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from './WalletContext';

interface Web3ContextType {
  mintNFT: (metadata: NFTMetadata) => Promise<string | null>;
  createAuction: (tokenId: string, startingPrice: string, duration: number) => Promise<boolean>;
  placeBid: (tokenId: string, bidAmount: string) => Promise<boolean>;
  buyNFT: (tokenId: string, price: string) => Promise<boolean>;
  listNFT: (tokenId: string, price: string) => Promise<boolean>;
  isProcessing: boolean;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  price: string;
  collectionId?: string;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { account, isConnected } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  // Mint NFT
  const mintNFT = async (metadata: NFTMetadata): Promise<string | null> => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/nfts/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(metadata)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success('NFT minted successfully!');
      return data.data.tokenId;

    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Create auction
  const createAuction = async (
    tokenId: string,
    startingPrice: string,
    duration: number
  ): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setIsProcessing(true);

      const response = await fetch('/api/nfts/auction/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tokenId,
          startingPrice,
          duration
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success('Auction created successfully!');
      return true;

    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error('Failed to create auction');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Place bid
  const placeBid = async (tokenId: string, bidAmount: string): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setIsProcessing(true);

      const response = await fetch('/api/nfts/auction/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tokenId,
          bidAmount
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success('Bid placed successfully!');
      return true;

    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Buy NFT
  const buyNFT = async (tokenId: string, price: string): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setIsProcessing(true);

      const response = await fetch('/api/nfts/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tokenId,
          price
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success('NFT purchased successfully!');
      return true;

    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error('Failed to buy NFT');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // List NFT for sale
  const listNFT = async (tokenId: string, price: string): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      setIsProcessing(true);

      const response = await fetch('/api/nfts/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tokenId,
          price
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success('NFT listed successfully!');
      return true;

    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const value = {
    mintNFT,
    createAuction,
    placeBid,
    buyNFT,
    listNFT,
    isProcessing
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};