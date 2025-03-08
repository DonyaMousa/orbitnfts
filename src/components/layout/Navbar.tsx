import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Orbit, Menu, X, Search, Sun, Moon, Wallet } from "lucide-react";
import Button from "../ui/Button";
import { useUI } from "../../contexts/UIContext";
import { useWallet } from "../../contexts/WalletContext";

const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    isDarkMode,
    toggleDarkMode,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  } = useUI();
  const {
    isConnected,
    account,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if the navbar should be transparent (only on homepage)
  const isHomepage = location.pathname === "/";

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Create", path: "/create" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomepage
          ? "bg-white/80 dark:bg-dark-400/80 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={closeMobileMenu}
          >
            <Orbit className="h-8 w-8 text-primary-500" />
            <span
              className="text-xl font-display font-bold gradient-text navbar-logo"
              style={{ fontFamily: "'FirstFont', system-ui, sans-serif" }}
            >
              OrbitNFTs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  location.pathname === link.path
                    ? "text-primary-500"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center relative max-w-xs w-full mx-4">
            <input
              type="text"
              placeholder="Search NFTs, collections..."
              className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-dark-300 border border-gray-200 dark:border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Wallet className="h-4 w-4" />}
                  onClick={() => disconnectWallet()}
                >
                  {formatAddress(account || "")}
                </Button>
                <Link to={`/profile/${account}`}>
                  <Button variant="primary" size="sm">
                    My Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Wallet className="h-4 w-4" />}
                onClick={() => connectWallet()}
                isLoading={isConnecting}
              >
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-dark-300 border-t border-gray-200 dark:border-dark-200"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search NFTs, collections..."
                  className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-dark-200 border border-gray-200 dark:border-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? "text-primary-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="flex flex-col space-y-3 pt-2 border-t border-gray-200 dark:border-dark-200">
                {/* Theme Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Wallet Connection */}
                {isConnected ? (
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Wallet className="h-4 w-4" />}
                      onClick={() => disconnectWallet()}
                      fullWidth
                    >
                      {formatAddress(account || "")}
                    </Button>
                    <Link to={`/profile/${account}`} onClick={closeMobileMenu}>
                      <Button variant="primary" size="sm" fullWidth>
                        My Profile
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Wallet className="h-4 w-4" />}
                    onClick={() => connectWallet()}
                    isLoading={isConnecting}
                    fullWidth
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
