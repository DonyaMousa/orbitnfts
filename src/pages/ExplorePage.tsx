import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import { useNFT, NFT } from '../contexts/NFTContext';
import NFTGrid from '../components/nft/NFTGrid';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ExplorePage: React.FC = () => {
  const { nfts, loadingNFTs } = useNFT();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredNFTs, setFilteredNFTs] = useState<NFT[]>(nfts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [listingType, setListingType] = useState<string>('all');
  
  // Categories
  const categories = ['Art', 'Collectibles', 'Music', 'Photography', 'Sports', 'Utility', 'Virtual Worlds'];
  
  // Apply filters
  useEffect(() => {
    let filtered = [...nfts];
    
    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(nft => 
        nft.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Price range filter
    filtered = filtered.filter(nft => {
      const price = parseFloat(nft.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Listing type filter
    if (listingType === 'auction') {
      filtered = filtered.filter(nft => nft.isAuction);
    } else if (listingType === 'fixed') {
      filtered = filtered.filter(nft => nft.isListed && !nft.isAuction);
    }
    
    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes);
    }
    
    setFilteredNFTs(filtered);
    
    // Update URL params
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'recent') params.set('sort', sortBy);
    if (listingType !== 'all') params.set('type', listingType);
    setSearchParams(params);
    
  }, [nfts, searchQuery, selectedCategory, priceRange, sortBy, listingType, setSearchParams]);
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };
  
  // Handle price range change
  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = parseFloat(e.target.value);
    setPriceRange([min, priceRange[1]]);
  };
  
  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = parseFloat(e.target.value);
    setPriceRange([priceRange[0], max]);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange([0, 10]);
    setSortBy('recent');
    setListingType('all');
    setSearchParams({});
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Explore NFTs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover, collect, and sell extraordinary NFTs
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Button
              variant="outline"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            <div className="relative">
              <Input
                placeholder="Search NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full md:w-64"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-dark-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                  <button
                    className="text-sm text-primary-500 hover:text-primary-600"
                    onClick={resetFilters}
                  >
                    Reset All
                  </button>
                </div>
                
                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedCategory === category
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-100'
                        }`}
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Price Range (ETH)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={handlePriceMinChange}
                        min={0}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={handlePriceMaxChange}
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Listing Type */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Listing Type
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        listingType === 'all'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-100'
                      }`}
                      onClick={() => setListingType('all')}
                    >
                      All Items
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        listingType === 'fixed'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-100'
                      }`}
                      onClick={() => setListingType('fixed')}
                    >
                      Fixed Price
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        listingType === 'auction'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-100'
                      }`}
                      onClick={() => setListingType('auction')}
                    >
                      Auction
                    </button>
                  </div>
                </div>
                
                {/* Sort By */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Sort By
                  </h4>
                  <select
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-300 rounded-lg border border-gray-300 dark:border-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all duration-200"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Recently Added</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* NFT Grid */}
          <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <NFTGrid
              nfts={filteredNFTs}
              loading={loadingNFTs}
              emptyMessage="No NFTs found matching your criteria"
              columns={showFilters ? 3 : 4}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExplorePage;