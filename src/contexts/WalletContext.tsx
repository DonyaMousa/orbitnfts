import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

interface UserProfile {
  _id: string;
  walletAddress: string;
  username: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  role: string;
}

interface WalletContextType {
  account: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  userProfile: UserProfile | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Check if wallet is connected
  const isConnected = !!account;

  // Initialize wallet from localStorage
  useEffect(() => {
    const checkConnection = async () => {
      const savedAccount = localStorage.getItem("walletAccount");
      const token = localStorage.getItem("token");

      if (savedAccount && token) {
        try {
          setIsConnecting(true);
          const provider = new ethers.BrowserProvider(window.ethereum);

          // Check if still connected to MetaMask
          const accounts = await provider.listAccounts();

          if (
            accounts.length > 0 &&
            accounts[0].address.toLowerCase() === savedAccount.toLowerCase()
          ) {
            // Valid connection exists
            setAccount(savedAccount);

            // Fetch user's balance
            const balance = await provider.getBalance(savedAccount);
            setBalance(ethers.formatEther(balance));

            // Get network information
            const network = await provider.getNetwork();
            setChainId(Number(network.chainId));

            // Fetch user profile
            await fetchUserProfile(savedAccount);
          } else {
            // Connection no longer valid
            disconnectWallet();
          }
        } catch (error) {
          console.error("Failed to restore wallet connection:", error);
          disconnectWallet();
        } finally {
          setIsConnecting(false);
        }
      }
    };

    checkConnection();
  }, []);

  // Fetch user profile from the server
  const fetchUserProfile = async (address: string) => {
    try {
      console.log(`Fetching profile data for wallet: ${address}`);
      const response = await fetch(`${API_URL}/api/profile/${address}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Profile data received:", data);
        if (data.success && data.user) {
          // Map the returned user to our UserProfile format
          const profile: UserProfile = {
            _id: data.user._id,
            walletAddress: data.user.address,
            username: data.user.username,
            avatarUrl: data.user.avatarUrl,
            bio: data.user.bio || "",
            isVerified: data.user.isVerified,
            role: data.user.role || "user",
          };
          setUserProfile(profile);
          console.log("User profile set successfully");
        } else {
          console.log("Profile data missing or invalid format");
        }
      } else {
        console.log("No profile found for this address, using defaults");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Update user profile
  const updateUserProfile = async (
    data: Partial<UserProfile>
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");

      if (!token || !account) {
        toast.error("You must be logged in to update your profile");
        return false;
      }

      console.log("Preparing to update user profile with data:", {
        username: data.username,
        bio: data.bio,
        hasImage: !!data.avatarUrl,
        imageSize: data.avatarUrl ? data.avatarUrl.length : 0,
      });

      // If avatarUrl is a data URL and it's too large, resize or convert it
      let processedData = { ...data };
      if (
        data.avatarUrl &&
        data.avatarUrl.startsWith("data:image/") &&
        data.avatarUrl.length > 500000
      ) {
        console.log("Image is too large, processing to smaller size");

        try {
          // Create a smaller version of the image
          const smallerImage = await resizeImage(data.avatarUrl, 500); // 500px width, maintain aspect ratio
          processedData.avatarUrl = smallerImage;
          console.log(
            `Resized image from ${data.avatarUrl.length} to ${smallerImage.length} bytes`
          );
        } catch (imgError) {
          console.error("Failed to resize image:", imgError);
          // Fall back to default avatar if image processing fails
          processedData.avatarUrl = `https://avatars.dicebear.com/api/identicon/${account}.svg`;
        }
      }

      // Use the correct endpoint
      const response = await fetch(`${API_URL}/api/profile/update`, {
        method: "POST", // Changed from PUT to POST to match server
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: processedData.username,
          bio: processedData.bio,
          image: processedData.avatarUrl,
          address: account,
        }),
      });

      console.log("Profile update response status:", response.status);

      const result = await response.json();
      console.log("Profile update response:", result);

      if (response.ok && result.success) {
        // Map the returned user to our UserProfile format
        const updatedProfile: UserProfile = {
          _id: result.user._id,
          walletAddress: result.user.address,
          username: result.user.username,
          avatarUrl: result.user.avatarUrl,
          bio: result.user.bio || "",
          isVerified: result.user.isVerified,
          role: result.user.role || "user",
        };

        setUserProfile(updatedProfile);
        toast.success("Profile updated successfully");
        return true;
      } else {
        console.error("Profile update failed:", result);
        toast.error(result.message || "Failed to update profile");
        return false;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
      return false;
    }
  };

  // Helper function to resize image
  const resizeImage = (dataUrl: string, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
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
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality JPEG
        resolve(resizedDataUrl);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for resizing"));
      };

      img.src = dataUrl;
    });
  };

  // Connect to wallet
  const connectWallet = async () => {
    if (isConnecting) return;

    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install MetaMask first.");
      return;
    }

    try {
      setIsConnecting(true);

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      // Get the connected account
      const signer = await provider.getSigner();
      const currentAccount = signer.address;

      // Get user's balance
      const balance = await provider.getBalance(currentAccount);

      // Get network information
      const network = await provider.getNetwork();

      // Update state with wallet information
      setAccount(currentAccount);
      setBalance(ethers.formatEther(balance));
      setChainId(Number(network.chainId));

      // Store in localStorage
      localStorage.setItem("walletAccount", currentAccount);

      // Register user with the API
      await registerWithAPI(currentAccount);

      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Register the user with the API
  const registerWithAPI = async (address: string) => {
    try {
      console.log(`Registering wallet with API: ${address}`);
      // Send the wallet address to the backend
      const response = await fetch(`${API_URL}/api/auth/wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      console.log("Wallet registration response:", data);

      if (data.success && data.token) {
        // Store the auth token
        localStorage.setItem("token", data.token);

        // Store user profile if available
        if (data.user) {
          // Map the returned user to our UserProfile format
          const profile: UserProfile = {
            _id: data.user._id,
            walletAddress: data.user.address,
            username: data.user.username,
            avatarUrl: data.user.avatarUrl,
            bio: data.user.bio || "",
            isVerified: data.user.isVerified,
            role: data.user.role || "user",
          };
          setUserProfile(profile);
          console.log("User profile set during registration");
        }
      } else {
        console.error("API registration failed:", data);
      }
    } catch (error) {
      console.error("API registration error:", error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0");
    setChainId(null);
    setUserProfile(null);
    localStorage.removeItem("walletAccount");
    localStorage.removeItem("token");
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // User switched accounts
          setAccount(accounts[0]);
          localStorage.setItem("walletAccount", accounts[0]);
          toast.success("Account changed");
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        toast.success("Network changed");
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [account]);

  const value = {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    userProfile,
    connectWallet,
    disconnectWallet,
    updateUserProfile,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
