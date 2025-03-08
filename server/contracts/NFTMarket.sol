// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarket is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.025 ether;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool isAuction;
        uint256 auctionEndTime;
        uint256 highestBid;
        address highestBidder;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event AuctionCreated(
        uint256 indexed tokenId,
        uint256 startingPrice,
        uint256 duration
    );

    event BidPlaced(
        uint256 indexed tokenId,
        address bidder,
        uint256 amount
    );

    constructor() ERC721("OrbitNFTs", "ONFT") {
        owner = payable(msg.sender);
    }

    function mintNFT(string memory tokenURI, uint256 price) public payable returns (uint256) {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        createMarketItem(newTokenId, price);

        return newTokenId;
    }

    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be at least 1 wei");

        idToMarketItem[tokenId] =  MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            false,
            0,
            0,
            address(0)
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    }

    function createAuction(uint256 tokenId, uint256 startingPrice, uint256 duration) public {
        require(ownerOf(tokenId) == msg.sender, "Only item owner can start auction");
        require(duration > 0, "Duration must be greater than 0");

        MarketItem storage item = idToMarketItem[tokenId];
        item.isAuction = true;
        item.price = startingPrice;
        item.auctionEndTime = block.timestamp + duration;

        emit AuctionCreated(tokenId, startingPrice, duration);
    }

    function placeBid(uint256 tokenId) public payable {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.isAuction, "Item is not up for auction");
        require(block.timestamp < item.auctionEndTime, "Auction has ended");
        require(msg.value > item.highestBid, "Bid must be higher than current bid");

        if (item.highestBidder != address(0)) {
            // Refund the previous highest bidder
            payable(item.highestBidder).transfer(item.highestBid);
        }

        item.highestBid = msg.value;
        item.highestBidder = msg.sender;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint256 tokenId) public {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.isAuction, "Item is not up for auction");
        require(block.timestamp >= item.auctionEndTime, "Auction has not ended yet");

        if (item.highestBidder != address(0)) {
            // Transfer NFT to highest bidder
            _transfer(address(this), item.highestBidder, tokenId);
            item.owner = payable(item.highestBidder);
            item.sold = true;
            _itemsSold.increment();

            // Transfer funds to seller
            payable(item.seller).transfer(item.highestBid);
        }

        item.isAuction = false;
    }

    function getMarketItem(uint256 tokenId) public view returns (MarketItem memory) {
        return idToMarketItem[tokenId];
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }
}