import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Eye,
  Share2,
  Clock,
  Tag,
  ShoppingCart,
  Gavel,
  AlertCircle,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  History,
  Info,
  ExternalLink,
  DollarSign,
  User,
  Award,
  Copy,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useNFT } from "../contexts/NFTContext";
import { useWallet } from "../contexts/WalletContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import Input from "../components/ui/Input";
import { NFTImage } from "../components/nft/NFTImage";
import { NFTActivityList } from "../components/nft/NFTActivity";
import { ErrorBoundary } from "../components/ErrorBoundary";
import toast from "react-hot-toast";

// Fade in animation variant
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const NFTDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account } = useWallet();
  const { fetchNFTById, buyNFT, placeBid, likeNFT, nfts } = useNFT();

  const [nft, setNft] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isOwner, setIsOwner] = useState(false);

  // Load the NFT by ID
  const loadNFT = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await fetchNFTById(id);

      if (data) {
        setNft(data);

        // Check if the current user is the owner
        if (
          account &&
          data.owner &&
          account.toLowerCase() === data.owner.toLowerCase()
        ) {
          setIsOwner(true);
        }
      }
    } catch (error) {
      console.error("Failed to load NFT:", error);
      toast.error("Failed to load NFT details");
    } finally {
      setLoading(false);
    }
  }, [id, fetchNFTById, account]);

  useEffect(() => {
    loadNFT();
  }, [loadNFT]);

  // Handle buying an NFT
  const handleBuy = async () => {
    if (!nft || !account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);
      const success = await buyNFT(nft.id);

      if (success) {
        toast.success("Successfully purchased NFT!");
        loadNFT(); // Reload the NFT data
      }
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast.error("Failed to buy NFT");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bidding on an NFT
  const handleBid = async () => {
    if (!nft || !account || !bidAmount) {
      toast.error(
        account
          ? "Please enter a bid amount"
          : "Please connect your wallet first"
      );
      return;
    }

    try {
      setIsProcessing(true);
      const success = await placeBid(nft.id, bidAmount);

      if (success) {
        toast.success("Bid placed successfully!");
        setBidAmount("");
        loadNFT(); // Reload the NFT data
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle liking an NFT
  const handleLike = async () => {
    if (!nft || !account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const success = await likeNFT(nft.id);

      if (success) {
        setNft((prev) => ({
          ...prev,
          likes: prev.likes + 1,
          isLiked: true,
        }));
      }
    } catch (error) {
      console.error("Error liking NFT:", error);
      toast.error("Failed to like NFT");
    }
  };

  // Format time left
  const formatTimeLeft = (endTime: string) => {
    if (!endTime) return "N/A";

    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format price
  const formatPrice = (price: string | number) => {
    if (!price) return "0";
    return typeof price === "string"
      ? parseFloat(price).toFixed(3)
      : price.toFixed(3);
  };

  // Shortened Address
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, message = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading NFT details...
          </p>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-center">NFT Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          The NFT you're looking for doesn't exist or has been removed
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Link to="/explore">
            <Button variant="primary">Explore NFTs</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get related NFTs (same creator or collection)
  const relatedNFTs =
    nfts
      ?.filter(
        (item) =>
          item.id !== nft.id &&
          (item.creator === nft.creator || item.collection === nft.collection)
      )
      .slice(0, 4) || [];

  return (
    <ErrorBoundary>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl"
      >
        {/* Breadcrumbs */}
        <div className="flex items-center mb-6 text-sm">
          <Link
            to="/"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Home
          </Link>
          <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
          <Link
            to="/explore"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Explore
          </Link>
          <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {nft.name}
          </span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column - NFT Image */}
          <div className="lg:col-span-2 space-y-6">
            <div className="sticky top-24">
              <NFTImage
                src={nft.image || nft.imageUrl}
                alt={nft.name}
                className="rounded-xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300"
              />

              {/* NFT Quick Stats */}
              <div className="mt-6 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm shadow-sm">
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                  <button
                    onClick={handleLike}
                    className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${nft.isLiked ? "fill-red-500 text-red-500" : ""}`}
                    />
                    <span>{nft.likes || 0}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <Eye className="w-5 h-5" />
                    <span>{nft.views || 0}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        window.location.href,
                        "Link copied to clipboard!"
                      )
                    }
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - NFT Details */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-lg">
              {/* Collection & Verification */}
              <div className="flex items-center space-x-2 mb-4">
                {nft.collection && (
                  <Link
                    to={`/collection/${nft.collectionId || nft.collection}`}
                  >
                    <Badge
                      variant="outline"
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {nft.collectionName || nft.collection}
                    </Badge>
                  </Link>
                )}
                {nft.verified && (
                  <Badge
                    variant="outline"
                    className="px-3 py-1 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400"
                >
                  {nft.category || "Art"}
                </Badge>
              </div>

              {/* NFT Title */}
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                {nft.name}
              </h1>

              {/* Creator/Owner */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created by
                  </div>
                  <Link
                    to={`/profile/${nft.creator}`}
                    className="flex items-center space-x-2 group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={
                          nft.creatorImage ||
                          `https://avatars.dicebear.com/api/identicon/${nft.creator}.svg`
                        }
                        alt={nft.creator}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {nft.creatorName || shortenAddress(nft.creator)}
                    </span>
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Owned by
                  </div>
                  <Link
                    to={`/profile/${nft.owner}`}
                    className="flex items-center space-x-2 group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={
                          nft.ownerImage ||
                          `https://avatars.dicebear.com/api/identicon/${nft.owner}.svg`
                        }
                        alt={nft.owner}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {nft.ownerName || shortenAddress(nft.owner)}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "details"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "properties"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("properties")}
                >
                  Properties
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "history"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  History
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeTab === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {nft.description ||
                            "No description available for this NFT."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Token ID
                            </div>
                            <div className="font-medium flex items-center">
                              {nft.tokenId || "N/A"}
                              <button
                                onClick={() =>
                                  copyToClipboard(nft.tokenId || "")
                                }
                                className="ml-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Blockchain
                            </div>
                            <div className="font-medium flex items-center">
                              {nft.blockchain || "Ethereum"}
                              <Shield className="w-3.5 h-3.5 ml-2 text-blue-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "properties" && (
                    <motion.div
                      key="properties"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {nft.attributes && nft.attributes.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {nft.attributes.map((attr: any, index: number) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30"
                            >
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                                {attr.trait_type || attr.type}
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white truncate">
                                {attr.value}
                              </div>
                              {attr.rarity && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  {attr.rarity}% have this
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No properties found for this NFT</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "history" && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {nft.activities && nft.activities.length > 0 ? (
                        <div className="space-y-4">
                          {nft.activities.map(
                            (activity: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`
                                  w-8 h-8 rounded-full flex items-center justify-center
                                  ${activity.type === "Sale" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : ""}
                                  ${activity.type === "Listing" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : ""}
                                  ${activity.type === "Bid" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : ""}
                                  ${activity.type === "Transfer" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" : ""}
                                  ${activity.type === "Mint" ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" : ""}
                                `}
                                  >
                                    {activity.type === "Sale" && (
                                      <DollarSign className="w-4 h-4" />
                                    )}
                                    {activity.type === "Listing" && (
                                      <Tag className="w-4 h-4" />
                                    )}
                                    {activity.type === "Bid" && (
                                      <Gavel className="w-4 h-4" />
                                    )}
                                    {activity.type === "Transfer" && (
                                      <Share2 className="w-4 h-4" />
                                    )}
                                    {activity.type === "Mint" && (
                                      <Award className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {activity.type}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      by{" "}
                                      {activity.user ? (
                                        <Link
                                          to={`/profile/${activity.user}`}
                                          className="hover:text-blue-500 dark:hover:text-blue-400"
                                        >
                                          {shortenAddress(activity.user)}
                                        </Link>
                                      ) : (
                                        "Unknown"
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {activity.price && (
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {formatPrice(activity.price)} ETH
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(activity.date).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No history records found for this NFT</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Price & Actions Card */}
            <div className="bg-white dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {nft.auction ? "Current Bid" : "Price"}
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(nft.price)} ETH
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      $
                      {nft.priceUSD
                        ? parseFloat(nft.priceUSD).toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {nft.auction && (
                  <div className="mt-4 sm:mt-0 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Auction ends in
                    </div>
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {formatTimeLeft(nft.endTime)}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {isOwner ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="primary"
                      className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                      onClick={() => navigate(`/nft/${nft.id}/edit`)}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      List for Sale
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full sm:flex-1"
                      onClick={() => navigate(`/nft/${nft.id}/transfer`)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Transfer
                    </Button>
                  </div>
                ) : nft.auction ? (
                  <div className="space-y-3">
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Enter bid amount (min. ${formatPrice(nft.price || 0.001)} ETH)`}
                      min={nft.price || 0.001}
                      step="0.001"
                      className="w-full"
                    />
                    <Button
                      variant="primary"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                      onClick={handleBid}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Spinner className="w-4 h-4 mr-2" />
                      ) : (
                        <Gavel className="w-4 h-4 mr-2" />
                      )}
                      Place Bid
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                    onClick={handleBuy}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related NFTs */}
        {relatedNFTs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              More from this{" "}
              {nft.creator === relatedNFTs[0].creator
                ? "Creator"
                : "Collection"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedNFTs.map((relatedNft, index) => (
                <Link
                  key={relatedNft.id}
                  to={`/nft/${relatedNft.id}`}
                  className="block"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="relative w-full aspect-square">
                      <img
                        src={relatedNft.image || relatedNft.imageUrl}
                        alt={relatedNft.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (
                            !(e.target as HTMLImageElement).dataset.fallback
                          ) {
                            (e.target as HTMLImageElement).dataset.fallback =
                              "true";
                            (e.target as HTMLImageElement).src =
                              "/assets/images/nft-placeholder.png";
                          }
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {relatedNft.name}
                      </h3>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm font-medium">
                          {formatPrice(relatedNft.price)} ETH
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {relatedNft.category || "Art"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </ErrorBoundary>
  );
};

export default NFTDetailsPage;
