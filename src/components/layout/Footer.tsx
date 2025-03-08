import React from 'react';
import { Link } from 'react-router-dom';
import { Orbit, Twitter, Instagram, Github, Linkedin, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-dark-300 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Orbit className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-display font-bold gradient-text">OrbitNFTs</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              A futuristic NFT marketplace for buying, selling, and trading digital collectibles in the metaverse.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Marketplace</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/explore?category=art" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Art
                </Link>
              </li>
              <li>
                <Link to="/explore?category=collectibles" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Collectibles
                </Link>
              </li>
              <li>
                <Link to="/explore?category=music" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Music
                </Link>
              </li>
              <li>
                <Link to="/explore?category=photography" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Photography
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Create
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/platform-status" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                  Platform Status
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm flex items-center">
                  <span>Partners</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm flex items-center">
                  <span>Blog</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm flex items-center">
                  <span>Newsletter</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} OrbitNFTs. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;