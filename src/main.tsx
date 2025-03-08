import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { WalletProvider } from './contexts/WalletContext';
import { NFTProvider } from './contexts/NFTContext';
import { UIProvider } from './contexts/UIContext';
import { Web3Provider } from './contexts/Web3Context';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UIProvider>
        <WalletProvider>
          <Web3Provider>
            <NFTProvider>
              <App />
            </NFTProvider>
          </Web3Provider>
        </WalletProvider>
      </UIProvider>
    </BrowserRouter>
  </React.StrictMode>
);