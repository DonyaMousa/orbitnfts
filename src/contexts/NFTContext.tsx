import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useWallet } from "./WalletContext";
import toast from "react-hot-toast";

// Types
export interface NFT {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  image?: string;
  imageUrl?: string;
  price: string;
  owner: string;
  creator: string;
  tokenId: string;
  collection: string;
  blockchain: string;
  likes: number;
  views: number;
  isListed: boolean;
  isAuction: boolean;
  auctionEndTime?: string;
  highestBid?: string;
  highestBidder?: string;
  category: string;
  createdAt: string;
  metadataUrl?: string;
  currency?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  banner: string;
  owner: string;
  items: number;
  floorPrice: string;
  volume: string;
  verified: boolean;
}

interface NFTContextType {
  nfts: NFT[];
  featuredNFTs: NFT[];
  trendingNFTs: NFT[];
  collections: Collection[];
  trendingCollections: Collection[];
  userNFTs: NFT[];
  userCreatedNFTs: NFT[];
  userLikedNFTs: NFT[];
  loadingNFTs: boolean;
  fetchNFTs: () => Promise<void>;
  fetchNFTById: (id: string) => Promise<NFT | null>;
  fetchUserNFTs: (address: string) => Promise<NFT[]>;
  createNFT: (nftData: Partial<NFT>) => Promise<NFT | null>;
  buyNFT: (nftId: string) => Promise<boolean>;
  listNFT: (nftId: string, price: string) => Promise<boolean>;
  createAuction: (
    nftId: string,
    startPrice: string,
    endTime: string
  ) => Promise<boolean>;
  placeBid: (nftId: string, bidAmount: string) => Promise<boolean>;
  likeNFT: (nftId: string) => Promise<boolean>;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const useNFT = () => {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error("useNFT must be used within a NFTProvider");
  }
  return context;
};

interface NFTProviderProps {
  children: ReactNode;
}

// Mock data for NFTs
const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "Cosmic Voyager #001",
    description:
      "A journey through the cosmic void, capturing the essence of interstellar travel.",
    image:
      "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?q=80&w=2832&auto=format&fit=crop",
    price: "0.85",
    owner: "0x1234...5678",
    creator: "0x8765...4321",
    tokenId: "1",
    collection: "Cosmic Voyagers",
    blockchain: "Ethereum",
    likes: 128,
    views: 1024,
    isListed: true,
    isAuction: false,
    category: "Art",
    createdAt: "2023-09-15T14:30:00Z",
  },
  {
    id: "2",
    name: "Digital Dreamscape #42",
    description:
      "An AI-generated landscape from digital dreams and algorithmic imagination.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop",
    price: "1.2",
    owner: "0x2345...6789",
    creator: "0x2345...6789",
    tokenId: "42",
    collection: "Digital Dreamscapes",
    blockchain: "Ethereum",
    likes: 95,
    views: 876,
    isListed: true,
    isAuction: true,
    auctionEndTime: "2023-10-30T23:59:59Z",
    highestBid: "1.3",
    highestBidder: "0x3456...7890",
    category: "Digital Art",
    createdAt: "2023-08-22T09:15:00Z",
  },
  {
    id: "3",
    name: "Neon Genesis #007",
    description:
      "A cyberpunk-inspired creation showcasing the neon-lit streets of a future metropolis.",
    image:
      "https://images.unsplash.com/photo-1558244661-d248897f7bc4?q=80&w=2940&auto=format&fit=crop",
    price: "2.5",
    owner: "0x3456...7890",
    creator: "0x4567...8901",
    tokenId: "7",
    collection: "Neon Genesis",
    blockchain: "Ethereum",
    likes: 215,
    views: 1890,
    isListed: true,
    isAuction: false,
    category: "Cyberpunk",
    createdAt: "2023-07-10T18:45:00Z",
  },
  {
    id: "4",
    name: "Quantum Particle #128",
    description:
      "A visualization of quantum particles in motion, captured in a moment of quantum entanglement.",
    image:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2787&auto=format&fit=crop",
    price: "0.75",
    owner: "0x4567...8901",
    creator: "0x5678...9012",
    tokenId: "128",
    collection: "Quantum Particles",
    blockchain: "Ethereum",
    likes: 76,
    views: 543,
    isListed: true,
    isAuction: false,
    category: "Abstract",
    createdAt: "2023-09-05T11:20:00Z",
  },
  {
    id: "5",
    name: "Ethereal Landscape #21",
    description:
      "An otherworldly landscape that exists between dreams and reality.",
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2874&auto=format&fit=crop",
    price: "1.8",
    owner: "0x5678...9012",
    creator: "0x6789...0123",
    tokenId: "21",
    collection: "Ethereal Landscapes",
    blockchain: "Ethereum",
    likes: 189,
    views: 1456,
    isListed: true,
    isAuction: true,
    auctionEndTime: "2023-11-15T23:59:59Z",
    highestBid: "2.0",
    highestBidder: "0x7890...1234",
    category: "Landscape",
    createdAt: "2023-08-15T16:30:00Z",
  },
  {
    id: "6",
    name: "Astral Projection #99",
    description:
      "A visual representation of astral projection, where consciousness travels beyond the physical body.",
    image:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop",
    price: "3.2",
    owner: "0x6789...0123",
    creator: "0x7890...1234",
    tokenId: "99",
    collection: "Astral Projections",
    blockchain: "Ethereum",
    likes: 267,
    views: 2134,
    isListed: true,
    isAuction: false,
    category: "Spiritual",
    createdAt: "2023-07-28T13:10:00Z",
  },
];

// Mock data for collections
const mockCollections: Collection[] = [
  {
    id: "1",
    name: "Cosmic Voyagers",
    description:
      "A collection of cosmic-themed NFTs exploring the vastness of space.",
    image:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2811&auto=format&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=3540&auto=format&fit=crop",
    owner: "0x8765...4321",
    items: 100,
    floorPrice: "0.75",
    volume: "120",
    verified: true,
  },
  {
    id: "2",
    name: "Digital Dreamscapes",
    description:
      "AI-generated landscapes from digital dreams and algorithmic imagination.",
    image:
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2787&auto=format&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1520034475321-cbe63696469a?q=80&w=3540&auto=format&fit=crop",
    owner: "0x2345...6789",
    items: 50,
    floorPrice: "1.2",
    volume: "85",
    verified: true,
  },
  {
    id: "3",
    name: "Neon Genesis",
    description:
      "Cyberpunk-inspired creations showcasing neon-lit streets of future metropolises.",
    image:
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2940&auto=format&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=2940&auto=format&fit=crop",
    owner: "0x4567...8901",
    items: 75,
    floorPrice: "2.5",
    volume: "210",
    verified: true,
  },
];

// Update all API calls to use the correct port
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const NFTProvider: React.FC<NFTProviderProps> = ({ children }) => {
  const { account, isConnected } = useWallet();
  const [nfts, setNFTs] = useState<NFT[]>(mockNFTs);
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [userCreatedNFTs, setUserCreatedNFTs] = useState<NFT[]>([]);
  const [userLikedNFTs, setUserLikedNFTs] = useState<NFT[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState<boolean>(false);

  // Derived states
  const featuredNFTs = nfts.filter((nft) => nft.likes > 100);
  const trendingNFTs = [...nfts].sort((a, b) => b.views - a.views).slice(0, 8);
  const trendingCollections = [...collections].sort(
    (a, b) => parseFloat(b.volume) - parseFloat(a.volume)
  );

  // Fetch all NFTs
  const fetchNFTs = async () => {
    try {
      setLoadingNFTs(true);
      console.log(`Fetching all NFTs`);

      // Make API call to fetch NFTs from MongoDB
      const response = await fetch(`${API_URL}/api/nfts`);

      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
      }

      const data = await response.json();
      setNFTs(data.nfts);
      setLoadingNFTs(false);
      return;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("Failed to fetch NFTs. Please try again.");
      setLoadingNFTs(false);
    }
  };

  // Fetch NFT by ID
  const fetchNFTById = async (id: string): Promise<NFT | null> => {
    try {
      console.log(`Fetching NFT with ID: ${id}`);

      // Make API call to fetch NFT by ID from MongoDB
      const response = await fetch(`${API_URL}/api/nfts/${id}`);

      console.log(`NFT fetch response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to fetch NFT: ${response.statusText}`, errorData);
        throw new Error(
          errorData.message || `Failed to fetch NFT: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`NFT data retrieved for ID ${id}:`, data.success);

      if (!data.nft) {
        console.error("No NFT data in response:", data);
        throw new Error("No NFT data found in response");
      }

      return data.nft;
    } catch (error) {
      console.error(`Error fetching NFT by ID ${id}:`, error);
      toast.error("Failed to fetch NFT details. Please try again.");
      return null;
    }
  };

  // Fetch user's NFTs by address
  const fetchUserNFTs = useCallback(
    async (address: string): Promise<NFT[]> => {
      try {
        setLoadingNFTs(true);
        console.log(`Fetching NFTs for address: ${address}`);

        // Make API call to fetch user's NFTs from MongoDB
        const response = await fetch(`${API_URL}/api/nfts/owner/${address}`);

        console.log("NFT fetch response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error fetching NFTs:", errorData);
          throw new Error(
            errorData.message || `Failed to fetch NFTs: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Fetched NFTs data:", data);

        // Only update internal state if fetching for the current user
        if (address === account) {
          setUserNFTs(data.nfts);
        }

        setLoadingNFTs(false);
        return data.nfts;
      } catch (error) {
        console.error("Error fetching user NFTs:", error);
        setLoadingNFTs(false);
        toast.error("Failed to load NFTs. Please try again.");
        return [];
      }
    },
    [account, API_URL]
  );

  // Create a new NFT
  const createNFT = async (nftData: Partial<NFT>): Promise<NFT | null> => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet to create an NFT.");
        return null;
      }

      setLoadingNFTs(true);

      // Get token from localStorage or use a test token
      const token = localStorage.getItem("token") || "test-token";

      // Log the request details for debugging
      console.log("Creating NFT with data:", {
        name: nftData.name,
        description: nftData.description,
        image: nftData.image,
        price: nftData.price,
        category: nftData.category,
        collection: nftData.collection,
      });

      // Make API call to create a new NFT in MongoDB
      const response = await fetch(`${API_URL}/api/nfts/mint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account}`,
        },
        body: JSON.stringify({
          name: nftData.name,
          description: nftData.description,
          image: nftData.image,
          price: nftData.price,
          category: nftData.category,
          collection: nftData.collection,
          creator: account,
        }),
      });

      // Log the response status for debugging
      console.log("NFT creation response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("NFT creation error:", errorData);
        throw new Error(
          errorData.message || `Failed to create NFT: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("NFT creation successful:", data);

      const newNFT = data.nft;

      // Update state with new NFT
      setNFTs((prev) => [...prev, newNFT]);

      // Update user's created NFTs
      if (account) {
        setUserCreatedNFTs((prev) => [...prev, newNFT]);
      }

      setLoadingNFTs(false);
      toast.success("NFT created successfully!");
      return newNFT;
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create NFT. Please try again."
      );
      setLoadingNFTs(false);
      return null;
    }
  };

  // Buy an NFT
  const buyNFT = async (nftId: string): Promise<boolean> => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet to buy an NFT.");
        return false;
      }

      // In a real app, this would be a blockchain transaction
      const nftIndex = nfts.findIndex((nft) => nft.id === nftId);
      if (nftIndex === -1) {
        toast.error("NFT not found.");
        return false;
      }

      const updatedNFTs = [...nfts];
      updatedNFTs[nftIndex] = {
        ...updatedNFTs[nftIndex],
        owner: account || "",
        isListed: false,
        isAuction: false,
      };

      setNFTs(updatedNFTs);
      toast.success("NFT purchased successfully!");
      return true;
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast.error("Failed to buy NFT. Please try again.");
      return false;
    }
  };

  // List an NFT for sale
  const listNFT = async (nftId: string, price: string): Promise<boolean> => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet to list an NFT.");
        return false;
      }

      // In a real app, this would be a blockchain transaction
      const nftIndex = nfts.findIndex((nft) => nft.id === nftId);
      if (nftIndex === -1) {
        toast.error("NFT not found.");
        return false;
      }

      const updatedNFTs = [...nfts];
      updatedNFTs[nftIndex] = {
        ...updatedNFTs[nftIndex],
        price,
        isListed: true,
        isAuction: false,
      };

      setNFTs(updatedNFTs);
      toast.success("NFT listed for sale successfully!");
      return true;
    } catch (error) {
      console.error("Error listing NFT:", error);
      toast.error("Failed to list NFT. Please try again.");
      return false;
    }
  };

  // Create an auction for an NFT
  const createAuction = async (
    nftId: string,
    startPrice: string,
    endTime: string
  ): Promise<boolean> => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet to create an auction.");
        return false;
      }

      // In a real app, this would be a blockchain transaction
      const nftIndex = nfts.findIndex((nft) => nft.id === nftId);
      if (nftIndex === -1) {
        toast.error("NFT not found.");
        return false;
      }

      const updatedNFTs = [...nfts];
      updatedNFTs[nftIndex] = {
        ...updatedNFTs[nftIndex],
        price: startPrice,
        isListed: true,
        isAuction: true,
        auctionEndTime: endTime,
        highestBid: startPrice,
        highestBidder: account,
      };

      setNFTs(updatedNFTs);
      toast.success("Auction created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Failed to create auction. Please try again.");
      return false;
    }
  };

  // Place a bid on an NFT auction
  const placeBid = async (
    nftId: string,
    bidAmount: string
  ): Promise<boolean> => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet to place a bid.");
        return false;
      }

      // In a real app, this would be a blockchain transaction
      const nftIndex = nfts.findIndex((nft) => nft.id === nftId);
      if (nftIndex === -1) {
        toast.error("NFT not found.");
        return false;
      }

      const nft = nfts[nftIndex];
      if (!nft.isAuction) {
        toast.error("This NFT is not up for auction.");
        return false;
      }

      const currentHighestBid = parseFloat(nft.highestBid || "0");
      const newBid = parseFloat(bidAmount);

      if (newBid <= currentHighestBid) {
        toast.error("Bid amount must be higher than the current highest bid.");
        return false;
      }

      const updatedNFTs = [...nfts];
      updatedNFTs[nftIndex] = {
        ...updatedNFTs[nftIndex],
        highestBid: bidAmount,
        highestBidder: account,
      };

      setNFTs(updatedNFTs);
      toast.success("Bid placed successfully!");
      return true;
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid. Please try again.");
      return false;
    }
  };

  // Like an NFT
  const likeNFT = async (nftId: string): Promise<boolean> => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet to like an NFT.");
        return false;
      }

      // In a real app, this would be an API call
      const nftIndex = nfts.findIndex((nft) => nft.id === nftId);
      if (nftIndex === -1) {
        toast.error("NFT not found.");
        return false;
      }

      const updatedNFTs = [...nfts];
      updatedNFTs[nftIndex] = {
        ...updatedNFTs[nftIndex],
        likes: updatedNFTs[nftIndex].likes + 1,
      };

      setNFTs(updatedNFTs);
      setUserLikedNFTs((prev) => [...prev, updatedNFTs[nftIndex]]);
      toast.success("NFT liked!");
      return true;
    } catch (error) {
      console.error("Error liking NFT:", error);
      toast.error("Failed to like NFT. Please try again.");
      return false;
    }
  };

  // Handle user NFT data when account changes
  useEffect(() => {
    if (isConnected && account) {
      // Use a local function to avoid dependency issues
      const loadUserData = async () => {
        setLoadingNFTs(true);

        try {
          // Get user owned NFTs
          const userOwnedNFTs = await fetchUserNFTs(account);
          setUserNFTs(userOwnedNFTs);

          // Get user created NFTs - fetch from API instead of filtering local nfts
          const response = await fetch(
            `${API_URL}/api/nfts/creator/${account}`
          );
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched created NFTs:", data.nfts);
            setUserCreatedNFTs(data.nfts);
          } else {
            console.error("Failed to fetch created NFTs");
            setUserCreatedNFTs([]);
          }

          // Mock liked NFTs - in a real app, this would be a separate API call
          const userLiked = nfts.filter((nft) => nft.likes > 100).slice(0, 3);
          setUserLikedNFTs(userLiked);
        } catch (error) {
          console.error("Error loading user NFT data:", error);
        } finally {
          setLoadingNFTs(false);
        }
      };

      loadUserData();
    } else {
      setUserNFTs([]);
      setUserCreatedNFTs([]);
      setUserLikedNFTs([]);
    }
  }, [account, isConnected, fetchUserNFTs, API_URL]); // Added API_URL and removed nfts

  // Initial fetch of NFTs
  useEffect(() => {
    fetchNFTs();
  }, []);

  const value = {
    nfts,
    featuredNFTs,
    trendingNFTs,
    collections,
    trendingCollections,
    userNFTs,
    userCreatedNFTs,
    userLikedNFTs,
    loadingNFTs,
    fetchNFTs,
    fetchNFTById,
    fetchUserNFTs,
    createNFT,
    buyNFT,
    listNFT,
    createAuction,
    placeBid,
    likeNFT,
  };

  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
};
