import React from "react";
import { NFT } from "../../contexts/NFTContext";
import NFTCard from "./NFTCard";
import Spinner from "../ui/Spinner";

interface NFTGridProps {
  nfts: NFT[];
  loading?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4 | 5;
  variant?:
    | "glass"
    | "frosted"
    | "holographic"
    | "neon"
    | "default"
    | "compact"
    | "minimal";
  isLoading?: boolean;
  onNFTClick?: (nftId: string) => void;
}

const NFTGrid: React.FC<NFTGridProps> = ({
  nfts,
  loading = false,
  emptyMessage = "No NFTs found",
  columns = 4,
  variant = "default",
  isLoading = false,
  onNFTClick,
}) => {
  // Determine column class based on columns prop
  const getColumnClass = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case 5:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  // Handle NFT click with logging and error handling
  const handleNFTClick = (nftId: string) => {
    console.log(`NFT clicked: ${nftId}`);
    if (onNFTClick) {
      onNFTClick(nftId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${getColumnClass()} gap-6`}>
      {isLoading
        ? nfts.map((nft, index) => (
            <div
              key={nft.id || nft._id || index}
              onClick={() => handleNFTClick(nft.id || nft._id)}
            >
              <NFTCard
                nft={nft}
                index={index}
                variant={
                  variant === "minimal"
                    ? "glass"
                    : variant === "compact"
                      ? "frosted"
                      : "holographic"
                }
              />
            </div>
          ))
        : nfts.map((nft, index) => (
            <div
              key={nft.id || nft._id || index}
              onClick={() => handleNFTClick(nft.id || nft._id)}
            >
              <NFTCard
                nft={nft}
                index={index}
                variant={
                  variant === "minimal"
                    ? "glass"
                    : variant === "compact"
                      ? "frosted"
                      : "holographic"
                }
              />
            </div>
          ))}
    </div>
  );
};

export default NFTGrid;
