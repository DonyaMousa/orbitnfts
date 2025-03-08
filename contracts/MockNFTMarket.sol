// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockNFTMarket is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 private _itemsSold;

    uint256 private _listingPrice = 0.025 ether;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool isAuction;
        uint256 auctionEndTime;
        address highestBidder;
        uint256 highestBid;
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
        uint256 endTime
    );

    event BidPlaced(uint256 indexed tokenId, address bidder, uint256 bid);

    constructor() ERC721("OrbitNFTs", "ORBIT") {
        // No need to initialize Ownable in v4.x - msg.sender is automatically set as owner
    }

    function getListingPrice() public view returns (uint256) {
        return _listingPrice;
    }

    function setListingPrice(uint256 newPrice) public onlyOwner {
        _listingPrice = newPrice;
    }

    function mintNFT(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint256) {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == _listingPrice,
            "Price must be equal to listing price"
        );

        uint256 newTokenId = _nextTokenId++;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        idToMarketItem[newTokenId] = MarketItem(
            newTokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            false,
            0,
            address(0),
            0
        );

        emit MarketItemCreated(
            newTokenId,
            msg.sender,
            address(0),
            price,
            false
        );

        return newTokenId;
    }

    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 auctionEndTime
    ) public returns (bool) {
        require(
            idToMarketItem[tokenId].seller == msg.sender,
            "Only seller can start auction"
        );
        require(
            auctionEndTime > block.timestamp,
            "Auction end time must be in the future"
        );

        idToMarketItem[tokenId].isAuction = true;
        idToMarketItem[tokenId].auctionEndTime = auctionEndTime;
        idToMarketItem[tokenId].price = startingPrice;

        emit AuctionCreated(tokenId, startingPrice, auctionEndTime);
        return true;
    }

    function placeBid(uint256 tokenId) public payable returns (bool) {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.isAuction, "Not an auction");
        require(block.timestamp < item.auctionEndTime, "Auction ended");
        require(msg.value > item.highestBid, "Bid not high enough");

        // Return funds to the previous highest bidder
        if (item.highestBidder != address(0)) {
            payable(item.highestBidder).transfer(item.highestBid);
        }

        item.highestBidder = msg.sender;
        item.highestBid = msg.value;

        emit BidPlaced(tokenId, msg.sender, msg.value);
        return true;
    }

    function createMarketSale(uint256 tokenId) public payable returns (bool) {
        uint256 price = idToMarketItem[tokenId].price;
        require(msg.value == price, "Please submit the asking price");

        address seller = idToMarketItem[tokenId].seller;

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        _itemsSold++;

        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);

        return true;
    }

    function listNFT(
        uint256 tokenId,
        uint256 price
    ) public payable returns (bool) {
        require(ownerOf(tokenId) == msg.sender, "Only owner can list NFT");
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == _listingPrice, "Please submit the listing price");

        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(0));
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].sold = false;

        _transfer(msg.sender, address(this), tokenId);

        return true;
    }

    // Function to help with testing - ends an auction and transfers the NFT
    function endAuction(uint256 tokenId) public returns (bool) {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.isAuction, "Not an auction");
        require(
            block.timestamp >= item.auctionEndTime || msg.sender == owner(),
            "Auction not yet ended"
        );

        if (item.highestBidder != address(0)) {
            item.owner = payable(item.highestBidder);
            item.sold = true;
            _itemsSold++;
            _transfer(item.seller, item.highestBidder, tokenId);
            payable(item.seller).transfer(item.highestBid);
        }

        item.isAuction = false;
        return true;
    }

    // Helper functions for testing
    function getMarketItem(
        uint256 tokenId
    )
        public
        view
        returns (
            uint256 id,
            address seller,
            address owner,
            uint256 price,
            bool sold,
            bool isAuction,
            uint256 auctionEndTime,
            address highestBidder,
            uint256 highestBid
        )
    {
        MarketItem storage item = idToMarketItem[tokenId];
        return (
            item.tokenId,
            item.seller,
            item.owner,
            item.price,
            item.sold,
            item.isAuction,
            item.auctionEndTime,
            item.highestBidder,
            item.highestBid
        );
    }
}
