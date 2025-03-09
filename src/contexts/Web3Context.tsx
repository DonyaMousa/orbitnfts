import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useWallet } from "./WalletContext";

// Import ABI for blog contracts
import BlogPostABI from "../server/contracts/BlogPost.json";
import BlogCommentABI from "../server/contracts/BlogComment.json";

interface Web3ContextType {
  mintNFT: (metadata: NFTMetadata) => Promise<string | null>;
  createAuction: (
    tokenId: string,
    startingPrice: string,
    duration: number
  ) => Promise<boolean>;
  placeBid: (tokenId: string, bidAmount: string) => Promise<boolean>;
  buyNFT: (tokenId: string, price: string) => Promise<boolean>;
  listNFT: (tokenId: string, price: string) => Promise<boolean>;
  isProcessing: boolean;
  provider: ethers.providers.Web3Provider | null;
  account: string | null;
  blogPostContract: ethers.Contract | null;
  blogCommentContract: ethers.Contract | null;
  createBlogPost: (
    content: string,
    attachments?: File[]
  ) => Promise<string | null>;
  likeBlogPost: (postId: string) => Promise<boolean>;
  commentOnPost: (postId: string, content: string) => Promise<boolean>;
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
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { account, isConnected, provider: walletProvider } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [blogPostContract, setBlogPostContract] =
    useState<ethers.Contract | null>(null);
  const [blogCommentContract, setBlogCommentContract] =
    useState<ethers.Contract | null>(null);

  // Initialize providers and contracts
  useEffect(() => {
    const initProviderAndContracts = async () => {
      if (walletProvider && isConnected) {
        try {
          // Set provider
          setProvider(walletProvider);

          // Get network ID
          const network = await walletProvider.getNetwork();
          const networkId = network.chainId;

          // Get contract addresses from environment or deployment
          const blogPostAddress =
            import.meta.env.VITE_BLOG_POST_CONTRACT_ADDRESS ||
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
          const blogCommentAddress =
            import.meta.env.VITE_BLOG_COMMENT_CONTRACT_ADDRESS ||
            "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

          console.log("Using blog post contract address:", blogPostAddress);
          console.log(
            "Using blog comment contract address:",
            blogCommentAddress
          );

          // Create contract instances
          if (blogPostAddress) {
            const postContract = new ethers.Contract(
              blogPostAddress,
              BlogPostABI.abi,
              walletProvider.getSigner()
            );
            setBlogPostContract(postContract);
          }

          if (blogCommentAddress) {
            const commentContract = new ethers.Contract(
              blogCommentAddress,
              BlogCommentABI.abi,
              walletProvider.getSigner()
            );
            setBlogCommentContract(commentContract);
          }
        } catch (error) {
          console.error("Error initializing Web3:", error);
          toast.error("Failed to initialize blockchain connections");
        }
      }
    };

    if (isConnected) {
      initProviderAndContracts();
    }
  }, [isConnected, walletProvider]);

  // Initialize fallback contracts even without wallet connection
  useEffect(() => {
    const initFallbackContracts = async () => {
      try {
        // Only initialize fallback if no contracts yet
        if (!blogPostContract || !blogCommentContract) {
          console.log("Initializing fallback contracts for development");

          // Create a fallback provider
          const fallbackProvider = new ethers.providers.JsonRpcProvider(
            "http://localhost:8545"
          );

          // Get contract addresses from environment or use defaults
          const blogPostAddress =
            import.meta.env.VITE_BLOG_POST_CONTRACT_ADDRESS ||
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
          const blogCommentAddress =
            import.meta.env.VITE_BLOG_COMMENT_CONTRACT_ADDRESS ||
            "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

          // Create fallback contracts
          if (!blogPostContract && blogPostAddress) {
            const postContract = new ethers.Contract(
              blogPostAddress,
              BlogPostABI.abi,
              fallbackProvider
            );
            setBlogPostContract(postContract);
          }

          if (!blogCommentContract && blogCommentAddress) {
            const commentContract = new ethers.Contract(
              blogCommentAddress,
              BlogCommentABI.abi,
              fallbackProvider
            );
            setBlogCommentContract(commentContract);
          }

          // Set fallback provider if no provider
          if (!provider) {
            setProvider(fallbackProvider);
          }
        }
      } catch (error) {
        console.error("Error initializing fallback contracts:", error);
      }
    };

    initFallbackContracts();
  }, [blogPostContract, blogCommentContract, provider]);

  // Mint NFT
  const mintNFT = async (metadata: NFTMetadata): Promise<string | null> => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return null;
    }

    try {
      setIsProcessing(true);

      const response = await fetch("/api/nfts/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(metadata),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("NFT minted successfully!");
      return data.data.tokenId;
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT");
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
      toast.error("Please connect your wallet");
      return false;
    }

    try {
      setIsProcessing(true);

      const response = await fetch("/api/nfts/auction/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tokenId,
          startingPrice,
          duration,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("Auction created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Failed to create auction");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Place bid
  const placeBid = async (
    tokenId: string,
    bidAmount: string
  ): Promise<boolean> => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    try {
      setIsProcessing(true);

      const response = await fetch("/api/nfts/auction/bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tokenId,
          bidAmount,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("Bid placed successfully!");
      return true;
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Buy NFT
  const buyNFT = async (tokenId: string, price: string): Promise<boolean> => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    try {
      setIsProcessing(true);

      const response = await fetch("/api/nfts/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tokenId,
          price,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("NFT purchased successfully!");
      return true;
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast.error("Failed to buy NFT");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // List NFT for sale
  const listNFT = async (tokenId: string, price: string): Promise<boolean> => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    try {
      setIsProcessing(true);

      const response = await fetch("/api/nfts/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tokenId,
          price,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("NFT listed successfully!");
      return true;
    } catch (error) {
      console.error("Error listing NFT:", error);
      toast.error("Failed to list NFT");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Create a blog post and mint it as an NFT
  const createBlogPost = async (
    content: string,
    attachments?: File[]
  ): Promise<string | null> => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return null;
    }

    if (!blogPostContract) {
      toast.error("Blog contract not initialized");
      return null;
    }

    try {
      setIsProcessing(true);

      // For now, we're just calling the API, which will handle IPFS and blockchain interaction
      const response = await fetch("/api/blog/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content,
          attachments: [], // In a real implementation, we'd upload attachments to IPFS first
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("Post minted as NFT successfully!");
      return data.data.postId;
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast.error("Failed to create post");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Like a blog post
  const likeBlogPost = async (postId: string): Promise<boolean> => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    if (!blogPostContract) {
      toast.error("Blog contract not initialized");
      return false;
    }

    try {
      setIsProcessing(true);

      // Check if user has already liked the post
      const hasLiked = await blogPostContract.hasLiked(postId, account);

      // Call the appropriate contract method
      let tx;
      if (hasLiked) {
        tx = await blogPostContract.unlikePost(postId);
      } else {
        tx = await blogPostContract.likePost(postId);
      }

      // Wait for transaction to be mined
      await tx.wait();

      toast.success(
        hasLiked ? "Post unliked successfully!" : "Post liked successfully!"
      );
      return true;
    } catch (error) {
      console.error("Error liking blog post:", error);
      toast.error("Failed to like post");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Comment on a blog post
  const commentOnPost = async (
    postId: string,
    content: string
  ): Promise<boolean> => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    if (!blogCommentContract) {
      toast.error("Blog comment contract not initialized");
      return false;
    }

    try {
      setIsProcessing(true);

      // Call the contract method to add a comment
      const tx = await blogCommentContract.addComment(postId, content);

      // Wait for transaction to be mined
      await tx.wait();

      toast.success("Comment added successfully!");
      return true;
    } catch (error) {
      console.error("Error commenting on post:", error);
      toast.error("Failed to add comment");
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
    isProcessing,
    provider,
    account,
    blogPostContract,
    blogCommentContract,
    createBlogPost,
    likeBlogPost,
    commentOnPost,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
