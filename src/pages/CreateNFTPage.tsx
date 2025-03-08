import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  Info,
  Wand2,
  Sparkles,
} from "lucide-react";
import { usePollinationsImage } from "@pollinations/react";
import { useNFT } from "../contexts/NFTContext";
import { useWallet } from "../contexts/WalletContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import toast from "react-hot-toast";

const CreateNFTPage: React.FC = () => {
  const navigate = useNavigate();
  const { createNFT } = useNFT();
  const { isConnected } = useWallet();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [collection, setCollection] = useState("");
  const [category, setCategory] = useState("Art");
  const [price, setPrice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // AI Generation state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [selectedModel, setSelectedModel] = useState("flux");
  const [imageSize, setImageSize] = useState("1024x1024");

  // Use Pollinations hook for AI image generation
  const aiGeneratedImage = usePollinationsImage(prompt, {
    width: parseInt(imageSize.split("x")[0]),
    height: parseInt(imageSize.split("x")[1]),
    model: selectedModel,
    enabled: isGenerating,
  });

  // Watch for AI image generation completion
  React.useEffect(() => {
    if (isGenerating && aiGeneratedImage) {
      setImage(aiGeneratedImage);
      setIsGenerating(false);
      toast.success("AI image generated successfully!");
    }
  }, [aiGeneratedImage, isGenerating]);

  // Categories
  const categories = [
    "Art",
    "Collectibles",
    "Music",
    "Photography",
    "Sports",
    "Utility",
    "Virtual Worlds",
  ];

  // AI Models
  const aiModels = [
    { id: "flux", name: "Flux (Balanced)" },
    { id: "stable-diffusion", name: "Stable Diffusion" },
    { id: "dalle", name: "DALL-E" },
  ];

  // Image sizes
  const imageSizes = ["512x512", "768x768", "1024x1024"];

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, this would upload to IPFS or a storage service
    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      setImage(
        "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?q=80&w=2832&auto=format&fit=crop"
      );
      setIsUploading(false);
      toast.success("Image uploaded successfully");
    }, 1500);
  };

  // Handle AI image generation
  const handleGenerateImage = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt for AI generation");
      return;
    }

    setIsGenerating(true);
    toast.loading("Generating AI image...", { id: "generating" });
  };

  // Remove uploaded/generated image
  const removeImage = () => {
    setImage("");
    setPrompt("");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet to create an NFT");
      return;
    }

    if (!name || !description || !image) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsCreating(true);
      toast.loading("Creating your NFT...", { id: "creating-nft" });

      const nftData = {
        name,
        description,
        image,
        collection,
        category,
        price: price || "0.01", // Default price if not provided
      };

      console.log("Submitting NFT data:", nftData);

      const newNFT = await createNFT(nftData);

      if (newNFT) {
        toast.success("NFT created successfully!", { id: "creating-nft" });
        navigate(`/nft/${newNFT.id || newNFT._id}`);
      } else {
        toast.error("Failed to create NFT. Please try again.", {
          id: "creating-nft",
        });
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast.error("Failed to create NFT. Please try again.", {
        id: "creating-nft",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Create New NFT
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and mint your unique digital asset as an NFT
            </p>
          </div>

          <Card variant="glass" className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Image Upload/Generation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload File or Generate with AI{" "}
                  <span className="text-red-500">*</span>
                </label>

                {!image ? (
                  <div className="space-y-4">
                    {/* Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          PNG, JPG, GIF, WEBP or MP4. Max 100MB.
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          Drag and drop or click to browse
                        </p>
                        <div>
                          <label className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              leftIcon={<Upload className="h-4 w-4" />}
                              isLoading={isUploading}
                            >
                              {isUploading ? "Uploading..." : "Choose File"}
                            </Button>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,video/*"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* AI Generation Section */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-dark-400 text-gray-500 dark:text-gray-400">
                          Or generate with AI
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter a prompt to generate AI art..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          leftIcon={<Wand2 className="h-4 w-4" />}
                          onClick={() => setShowAIOptions(!showAIOptions)}
                        >
                          Options
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          leftIcon={<Sparkles className="h-4 w-4" />}
                          onClick={handleGenerateImage}
                          isLoading={isGenerating}
                          disabled={!prompt || isGenerating}
                        >
                          Generate
                        </Button>
                      </div>

                      {showAIOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-dark-300 rounded-lg"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              AI Model
                            </label>
                            <select
                              value={selectedModel}
                              onChange={(e) => setSelectedModel(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {aiModels.map((model) => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Image Size
                            </label>
                            <select
                              value={imageSize}
                              onChange={(e) => setImageSize(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {imageSizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt="NFT Preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      onClick={removeImage}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="mb-6">
                <Input
                  label="Name"
                  placeholder="Item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Provide a detailed description of your item"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-200 rounded-lg border border-gray-300 dark:border-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all duration-200"
                  required
                />
              </div>

              {/* Collection */}
              <div className="mb-6">
                <Input
                  label="Collection"
                  placeholder="Collection name (optional)"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-200 rounded-lg border border-gray-300 dark:border-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all duration-200"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="mb-6">
                <Input
                  label="Price (ETH)"
                  type="number"
                  placeholder="Enter price in ETH"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Info Box */}
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Before you create:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Make sure you have enough ETH for gas fees</li>
                      <li>
                        Your NFT will be minted on the Ethereum blockchain
                      </li>
                      <li>
                        Once minted, you can list it for sale or transfer it
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isCreating}
                  disabled={isCreating || !isConnected}
                  neonEffect
                >
                  Create NFT
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateNFTPage;
