import { useState } from 'react';
import { useNFT } from '../contexts/NFTContext';
import { useWallet } from '../contexts/WalletContext';
import { NFT } from '../types/nft';
import toast from 'react-hot-toast';

interface NFTActions {
  isProcessing: boolean;
  handleBuy: () => Promise<void>;
  handleBid: (amount: number) => Promise<void>;
  handleLike: () => Promise<void>;
}

export const useNFTActions = (nft: NFT | null): NFTActions => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { buyNFT, placeBid, likeNFT } = useNFT();
  const { isConnected } = useWallet();

  const checkWalletConnection = (): boolean => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return false;
    }
    return true;
  };

  const handleBuy = async (): Promise<void> => {
    if (!nft || !checkWalletConnection()) return;

    setIsProcessing(true);
    try {
      await buyNFT(nft.id);
      toast.success('NFT purchased successfully!');
    } catch (error) {
      console.error('Buy error:', error);
      toast.error('Failed to purchase NFT. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBid = async (amount: number): Promise<void> => {
    if (!nft || !checkWalletConnection()) return;

    if (amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    setIsProcessing(true);
    try {
      await placeBid(nft.id, amount);
      toast.success('Bid placed successfully!');
    } catch (error) {
      console.error('Bid error:', error);
      toast.error('Failed to place bid. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLike = async (): Promise<void> => {
    if (!nft || !checkWalletConnection()) return;

    try {
      await likeNFT(nft.id);
      toast.success('NFT liked!');
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like NFT');
    }
  };

  return {
    isProcessing,
    handleBuy,
    handleBid,
    handleLike
  };
};