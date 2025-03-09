import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Edit,
  Copy,
  CheckCircle,
  Grid,
  Heart,
  Clock,
  Settings,
  ExternalLink,
  Share2,
  TrendingUp,
  BarChart3,
  Wallet,
  Shield,
  Users,
  Star,
  Image,
  X,
  Upload,
} from "lucide-react";
import { useNFT } from "../contexts/NFTContext";
import { useWallet } from "../contexts/WalletContext";
import Button from "../components/ui/Button";
import NFTGrid from "../components/nft/NFTGrid";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import { NFT } from "../contexts/NFTContext";

// Define interfaces locally since they're not exported from WalletContext
interface UserProfile {
  _id: string;
  walletAddress: string;
  username: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  role: string;
}

// API URL - Updated to use environment variable
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Debug API URL
console.log("Using API URL:", API_URL);

const ProfilePage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { account, userProfile, updateUserProfile } = useWallet();
  const { fetchUserNFTs, userCreatedNFTs, userLikedNFTs } = useNFT();

  const [activeTab, setActiveTab] = useState<"collected" | "created" | "liked">(
    "collected"
  );
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("Anonymous Collector");
  const [profileBio, setProfileBio] = useState(
    "NFT enthusiast and digital art collector. Exploring the boundaries of blockchain creativity and digital ownership."
  );
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Mocked user stats
  const userStats = {
    totalVolume: "12.5 ETH",
    totalSales: 8,
    avgPrice: "1.56 ETH",
    followers: 256,
    following: 124,
  };

  // Check if profile is the current user's profile
  const isOwnProfile = address === account;

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard!");

      // Reset copied state after animation
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!address) return;

    setIsLoadingProfile(true);
    try {
      const response = await fetch(`${API_URL}/api/profile/${address}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Update state with user data
          setProfileName(data.user.username || "Anonymous Collector");
          setProfileBio(
            data.user.bio || "NFT enthusiast and digital art collector."
          );
          setProfileImage(data.user.avatarUrl || "");
        }
      } else {
        console.log("User profile not found, using defaults");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch user NFTs
  useEffect(() => {
    let isMounted = true;

    const loadUserNFTs = async () => {
      if (!address || address.trim() === "") {
        if (isMounted) {
          setLoading(false);
          setUserNFTs([]);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        try {
          console.log(`Fetching NFTs for address: ${address}`);

          // Fetch NFTs owned by this address
          const fetchedNFTs = await fetchUserNFTs(address);
          console.log("Fetched NFTs:", fetchedNFTs);

          if (isMounted) {
            setUserNFTs(fetchedNFTs);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error loading NFTs:", error);
          if (isMounted) {
            setLoading(false);
            toast.error("Failed to load NFTs");
          }
        }
      }
    };

    loadUserNFTs();
    fetchUserProfile(); // Fetch user profile data

    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
    };
  }, [address]);

  // Get NFTs based on active tab
  const getNFTsForActiveTab = () => {
    switch (activeTab) {
      case "collected":
        return userNFTs;
      case "created":
        console.log("Created NFTs:", userCreatedNFTs);
        return userCreatedNFTs;
      case "liked":
        return userLikedNFTs;
      default:
        return [];
    }
  };

  // Handle NFT click to navigate with proper error handling
  const handleNFTClick = (nftId: string) => {
    console.log(`Navigating to NFT detail: ${nftId}`);
    if (!nftId) {
      toast.error("Invalid NFT ID");
      return;
    }

    // We're using Link in the NFTGrid component which will handle navigation
    // This is just for any additional handling we might want to add
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error("Image is too large. Please select an image under 2MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error(
        "Selected file is not an image. Please select a valid image file."
      );
      return;
    }

    toast.success("Image selected successfully!");

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);

      // Log image info but not the entire data
      console.log(
        `Image loaded: ${file.name} (${file.type}), size: ${(file.size / 1024).toFixed(2)}KB, data length: ${result.length} chars`
      );
    };
    reader.onerror = () => {
      toast.error("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setIsLoadingProfile(true);

      // If we have a processed image, include it
      let avatarToUpdate = null;
      if (imagePreview) {
        if (imagePreview.length > 500000) {
          // If image is too large, resize it
          toast.loading("Processing your image...");

          // Create a smaller version using canvas
          const resizeImage = (
            dataUrl: string,
            maxWidth: number
          ): Promise<string> => {
            return new Promise((resolve, reject) => {
              const img = document.createElement("img");
              img.onload = () => {
                // Calculate new dimensions
                const aspectRatio = img.width / img.height;
                const width = Math.min(maxWidth, img.width);
                const height = width / aspectRatio;

                // Create canvas and resize
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                // Draw resized image
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  reject(new Error("Failed to get canvas context"));
                  return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Get resized data URL with reduced quality
                const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
                resolve(resizedDataUrl);
              };

              img.onerror = () => {
                reject(new Error("Failed to load image for resizing"));
              };

              img.src = dataUrl;
            });
          };

          const resizedImage = await resizeImage(imagePreview, 800);
          avatarToUpdate = resizedImage;
          toast.dismiss();
        } else {
          avatarToUpdate = imagePreview;
        }
      }

      // Validate profile data
      if (!profileName.trim()) {
        toast.error("Please provide a display name");
        setIsLoadingProfile(false);
        return;
      }

      // Truncate bio if too long
      const truncatedBio =
        profileBio.length > 500 ? profileBio.substring(0, 500) : profileBio;

      // Prepare the update data
      const updateData: {
        username: string;
        bio: string;
        avatarUrl?: string;
      } = {
        username: profileName.trim(),
        bio: truncatedBio,
      };

      // Only include avatar if we have a new one
      if (avatarToUpdate) {
        updateData.avatarUrl = avatarToUpdate;
      }

      console.log("Sending profile update data", {
        username: updateData.username,
        bioLength: updateData.bio?.length,
        hasAvatar: !!avatarToUpdate,
      });

      // Call the context method to update the profile
      const success = await updateUserProfile(updateData);

      if (success) {
        toast.success("Profile updated successfully");
        setEditModalOpen(false);
      } else {
        toast.error("An error occurred while updating your profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Update the profile data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileName(userProfile.username);
      setProfileBio(userProfile.bio || "");
      setProfileImage(userProfile.avatarUrl || "");
    }
  }, [userProfile]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Profile Info Card - Remove negative margin since there's no banner to overlap */}
        <div className="max-w-5xl mx-auto relative">
          <Card className="p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-lg">
                    <div className="w-full h-full relative bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
                      {isLoadingProfile ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : address ? (
                        <img
                          src={
                            profileImage ||
                            `https://api.dicebear.com/6.x/identicon/svg?seed=${address}`
                          }
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      {isOwnProfile && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all group">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white border-white/20"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span className="text-xs">Edit</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges positioned below avatar */}
                  <div className="flex mt-3 justify-center md:justify-start space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 px-2.5 py-0.5 flex items-center"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">Verified</span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 px-2.5 py-0.5 flex items-center"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">1.2K</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 flex flex-col items-center md:items-start">
                <div className="flex items-center mb-1 md:mb-2 space-x-2">
                  {isLoadingProfile ? (
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                      {profileName || "Anonymous Collector"}
                    </h1>
                  )}
                </div>

                <div className="flex items-center mb-3">
                  <div
                    className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800/70 px-2 py-1 rounded-md flex items-center"
                    onClick={copyAddressToClipboard}
                  >
                    <span>{formatAddress(address || "")}</span>
                    <Copy className="h-3.5 w-3.5 ml-1.5 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" />
                  </div>
                </div>

                {isLoadingProfile ? (
                  <div className="w-full max-w-xl space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-xl text-center md:text-left">
                    {profileBio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {isOwnProfile ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setEditModalOpen(true)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                    >
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      Follow
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 dark:border-gray-700"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1.5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto mt-3 sm:mt-4">
          <Card
            variant="outline"
            className="p-1.5 sm:p-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="flex justify-center overflow-x-auto no-scrollbar">
              <TabButton
                active={activeTab === "collected"}
                onClick={() => setActiveTab("collected")}
                icon={<Grid className="w-3.5 h-3.5" />}
                name="Collected"
                count={userNFTs.length}
              />
              <TabButton
                active={activeTab === "created"}
                onClick={() => setActiveTab("created")}
                icon={<BarChart3 className="w-3.5 h-3.5" />}
                name="Created"
                count={userCreatedNFTs.length}
              />
              <TabButton
                active={activeTab === "liked"}
                onClick={() => setActiveTab("liked")}
                icon={<Heart className="w-3.5 h-3.5" />}
                name="Liked"
                count={userLikedNFTs.length}
              />
            </div>
          </Card>
        </div>

        {/* NFT Grid */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : getNFTsForActiveTab().length === 0 ? (
                <Card
                  variant="outline"
                  className="p-8 sm:p-12 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center rounded-full w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                      {activeTab === "collected" ? (
                        <Grid className="h-6 sm:h-8 w-6 sm:w-8" />
                      ) : activeTab === "created" ? (
                        <BarChart3 className="h-6 sm:h-8 w-6 sm:w-8" />
                      ) : (
                        <Heart className="h-6 sm:h-8 w-6 sm:w-8" />
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No NFTs found
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                      {activeTab === "collected"
                        ? "You haven't collected any NFTs yet. Start exploring the marketplace!"
                        : activeTab === "created"
                          ? "You haven't created any NFTs yet. Get started with your first creation!"
                          : "You haven't liked any NFTs yet. Explore the marketplace to find your favorites!"}
                    </p>
                    {activeTab === "created" && (
                      <Link to="/create">
                        <Button variant="primary">Create NFT</Button>
                      </Link>
                    )}
                    {activeTab === "collected" && (
                      <Link to="/explore">
                        <Button variant="primary">Explore NFTs</Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ) : (
                <NFTGrid
                  nfts={getNFTsForActiveTab()}
                  columns={3}
                  onNFTClick={handleNFTClick}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in-50 slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Profile
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    {imagePreview || profileImage ? (
                      <img
                        src={
                          imagePreview ||
                          profileImage ||
                          `https://api.dicebear.com/6.x/identicon/svg?seed=${address}`
                        }
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="profile-image"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      JPEG, PNG, or GIF. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                  placeholder="Enter your display name"
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="profile-bio"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm resize-none"
                  placeholder="Tell others about yourself"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleProfileUpdate}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  name: string;
  count: number;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  name,
  count,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center py-1.5 sm:py-2 px-3 sm:px-4 mx-1 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 ${
      active
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
    }`}
  >
    <div className="flex items-center space-x-1.5 sm:space-x-2">
      <span
        className={
          active
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-500"
        }
      >
        {icon}
      </span>
      <span>{name}</span>
      <span
        className={`ml-1 py-0.5 px-1.5 rounded-full text-xs ${
          active
            ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
        }`}
      >
        {count}
      </span>
    </div>
  </button>
);

export default ProfilePage;
