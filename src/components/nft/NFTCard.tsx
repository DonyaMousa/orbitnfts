import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye, Clock, Sparkles, Shield, BadgeCheck } from "lucide-react";
import { NFT } from "../../contexts/NFTContext";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface NFTCardProps {
  nft: NFT;
  index?: number;
  variant?: "glass" | "frosted" | "holographic" | "neon";
}

const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  index = 0,
  variant = "holographic",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Handle different ID formats
  const getNftId = () => {
    return nft.id || nft._id || "";
  };

  // Format price with 2 decimal places
  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(2);
  };

  // Calculate time left for auctions
  const getTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;

    return `${minutes}m left`;
  };

  // Function to render rarity indicator
  const getRarityColor = (rarity: string = "common") => {
    const rarityLower = rarity.toLowerCase();
    if (rarityLower === "legendary")
      return "bg-gradient-to-r from-yellow-400 to-orange-500";
    if (rarityLower === "epic")
      return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (rarityLower === "rare")
      return "bg-gradient-to-r from-blue-400 to-indigo-500";
    if (rarityLower === "uncommon")
      return "bg-gradient-to-r from-green-400 to-emerald-500";
    return "bg-gradient-to-r from-gray-400 to-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-card overflow-hidden relative w-full h-[380px] p-3 bg-white/30 dark:bg-black/20 backdrop-blur-xl cursor-pointer transition-all duration-300 border border-slate-200/50 dark:border-white/10 shadow-xl"
      style={{
        transform: isHovered ? "translateY(-5px)" : "none",
      }}
    >
      <Link to={`/nft/${getNftId()}`} className="block h-full w-full">
        <div className="relative h-full w-full rounded-lg overflow-hidden">
          <motion.div
            className="relative w-full h-[280px]"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={nft.image || nft.imageUrl}
              alt={nft.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                if (!(e.target as HTMLImageElement).dataset.fallback) {
                  (e.target as HTMLImageElement).dataset.fallback = "true";
                  (e.target as HTMLImageElement).src =
                    "/assets/images/nft-placeholder.png";
                }
              }}
            />

            {isHovered && (
              <>
                <motion.div
                  className="absolute top-2 right-2 text-yellow-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles size={20} />
                </motion.div>
                <motion.div
                  className="absolute bottom-2 left-2 text-yellow-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Sparkles size={16} />
                </motion.div>
              </>
            )}

            {nft.auction && (
              <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
                <p className="text-xs font-semibold text-white">Auction</p>
              </div>
            )}

            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
              <p className="text-xs font-semibold text-white">{nft.category}</p>
            </div>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold truncate">{nft.name}</h3>
              {nft.verified && <BadgeCheck className="h-5 w-5 text-blue-400" />}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 shadow-sm">
                  <img
                    src={
                      nft.creatorImage ||
                      `https://api.dicebear.com/6.x/identicon/svg?seed=${nft.creator}`
                    }
                    alt={
                      nft.creatorName ||
                      `Creator ${nft.creator?.substring(0, 6)}`
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-white/90 font-medium">
                  {nft.creatorName ||
                    `@${nft.creator ? nft.creator.substring(0, 6) : "unknown"}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  <span className="text-xs text-white/60">Price: </span>
                  <span
                    className={`${isHovered ? "text-gradient-blue-purple" : ""}`}
                  >
                    {nft.price} ETH
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default NFTCard;
