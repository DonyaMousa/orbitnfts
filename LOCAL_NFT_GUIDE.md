# Guide: Minting NFTs Locally for Testing

This guide will help you set up a local environment for minting and testing NFTs with your OrbitNFTs application.

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)
- Basic understanding of Ethereum and NFTs

## Step 1: Start a Local Ethereum Node

First, you need to start a local Ethereum node using Hardhat:

```bash
npm run hardhat:node
```

This will start a local Ethereum network with several pre-funded accounts that you can use for testing. Keep this terminal window open.

## Step 2: Deploy the NFT Contract

In a new terminal, deploy the MockNFTMarket contract to your local network:

```bash
npm run hardhat:deploy
```

This will deploy the contract and output the contract address. **Note this address** as you'll need it in the next steps.

## Step 3: Set the Contract Address

Set the deployed contract address as an environment variable:

```bash
# Linux/MacOS
export NFT_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Windows (Command Prompt)
set NFT_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Windows (PowerShell)
$env:NFT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

Replace the address above with the actual address from the deployment output.

## Step 4: Mint an NFT

Now you can mint an NFT with:

```bash
npm run mint:nft
```

This will mint a test NFT with sample metadata and output the transaction details.

## Step 5: View Your NFTs

To see the NFTs you own:

```bash
npm run view:nfts
```

This will display all NFTs owned by your address on the local network.

## Step 6: Start the Test Server

To use the local Ethereum network with your application:

```bash
npm run test:server
```

This will start your server in test mode, connecting to your local Ethereum network instead of a real one.

## Step 7: Use the Application

In another terminal, start the frontend:

```bash
npm run dev
```

Now you can interact with your application, which will be connected to your local Ethereum network and the NFTs you've minted.

## Troubleshooting

### Contract Function Errors

If you see function signature errors, it might mean that the script is calling functions that don't match your contract implementation. Check your `MockNFTMarket.sol` contract and update the scripts accordingly.

### Missing Contract Address

If you get an error about a missing contract address, make sure you've set the `NFT_CONTRACT_ADDRESS` environment variable correctly.

### Restarting from Scratch

If you want to start with a fresh state:

1. Stop the Hardhat node (Ctrl+C in the terminal running the node)
2. Restart the Hardhat node: `npm run hardhat:node`
3. Redeploy the contracts: `npm run hardhat:deploy`
4. Set the new contract address as an environment variable
5. Continue from step 4 above

## Additional Notes

- All transactions on the local network are free and instant, making it perfect for testing
- The local network resets each time you restart the Hardhat node
- Test ETH has no real value, it's only for local testing purposes
