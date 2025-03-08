export interface NFTActivity {
  id: string;
  type: 'sale' | 'bid' | 'transfer' | 'mint' | 'list';
  user: string;
  price?: number;
  date: string;
  txHash: string;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  tokenId: string;
  tokenStandard: 'ERC721' | 'ERC1155';
  blockchain: string;
  collectionId: string;
  collectionName: string;
  verified: boolean;
  type: 'buy' | 'auction';
  price: number;
  priceUSD: number;
  endTime?: string;
  likes: number;
  views: number;
  isLiked: boolean;
  owner: string;
  creator: string;
  activities: NFTActivity[];
}