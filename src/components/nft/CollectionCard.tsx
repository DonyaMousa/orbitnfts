import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Collection } from "../../contexts/NFTContext";
import Card from "../ui/Card";

interface CollectionCardProps {
  collection: Collection;
  index?: number;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/collection/${collection.id}`}>
        <Card
          variant="glass"
          className="overflow-hidden h-full bg-transparent"
          hoverEffect
          isInteractive
        >
          {/* Banner Image */}
          <div className="relative h-32 overflow-hidden rounded-t-lg">
            <img
              src={collection.banner || "/images/placeholder-banner.jpg"}
              alt={`${collection.name} banner`}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          {/* Collection Info */}
          <div className="p-4 bg-transparent">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 overflow-hidden border-4 border-white/20 rounded-full -mt-10 shadow-xl">
                <img
                  src={collection.image || "/images/placeholder-collection.jpg"}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white truncate">
                  {collection.name}
                </h3>
                <div className="flex items-center text-sm text-white/70">
                  <span>by </span>
                  <span className="ml-1 font-medium text-purple-400 hover:text-purple-300 transition-colors">
                    {collection.creator}
                  </span>
                </div>
              </div>
            </div>

            {/* Collection Stats */}
            <div className="grid grid-cols-3 gap-1 mt-4 text-center bg-transparent">
              <div className="py-2">
                <p className="text-xs text-white/60">Floor</p>
                <p className="font-medium text-white">
                  {collection.floorPrice} ETH
                </p>
              </div>
              <div className="py-2">
                <p className="text-xs text-white/60">Volume</p>
                <p className="font-medium text-white">
                  {collection.volume} ETH
                </p>
              </div>
              <div className="py-2">
                <p className="text-xs text-white/60">Items</p>
                <p className="font-medium text-white">{collection.items}</p>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default CollectionCard;
