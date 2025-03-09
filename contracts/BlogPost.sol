// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlogPost is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Structure to hold blog post data
    struct Post {
        uint256 tokenId;
        address author;
        string ipfsHash; // Hash of post content on IPFS
        uint256 timestamp;
        uint256 likesCount;
        bool isPublished;
    }

    // Mapping from tokenId to Post
    mapping(uint256 => Post) private _posts;

    // Mapping from user to their posts
    mapping(address => uint256[]) private _userPosts;

    // Mapping for likes: tokenId => user => liked
    mapping(uint256 => mapping(address => bool)) private _likes;

    // Events
    event PostCreated(
        uint256 indexed tokenId,
        address indexed author,
        string ipfsHash
    );
    event PostLiked(uint256 indexed tokenId, address indexed liker);
    event PostUnliked(uint256 indexed tokenId, address indexed unliker);

    constructor() ERC721("OrbitBlog", "BLOG") {}

    /**
     * @dev Creates a new blog post and mints it as an NFT
     * @param ipfsHash Hash of the post content stored on IPFS
     * @return tokenId of the newly minted post
     */
    function createPost(string memory ipfsHash) public returns (uint256) {
        // Increment token ID
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Mint the token
        _mint(msg.sender, newTokenId);

        // Set token URI to IPFS hash
        _setTokenURI(newTokenId, ipfsHash);

        // Create post data
        _posts[newTokenId] = Post(
            newTokenId,
            msg.sender,
            ipfsHash,
            block.timestamp,
            0,
            true
        );

        // Add to user's posts
        _userPosts[msg.sender].push(newTokenId);

        // Emit event
        emit PostCreated(newTokenId, msg.sender, ipfsHash);

        return newTokenId;
    }

    /**
     * @dev Likes a post
     * @param tokenId ID of the post to like
     */
    function likePost(uint256 tokenId) public {
        require(_exists(tokenId), "Post does not exist");
        require(!_likes[tokenId][msg.sender], "Post already liked");

        // Add like
        _likes[tokenId][msg.sender] = true;
        _posts[tokenId].likesCount++;

        // Emit event
        emit PostLiked(tokenId, msg.sender);
    }

    /**
     * @dev Unlikes a post
     * @param tokenId ID of the post to unlike
     */
    function unlikePost(uint256 tokenId) public {
        require(_exists(tokenId), "Post does not exist");
        require(_likes[tokenId][msg.sender], "Post not liked yet");

        // Remove like
        _likes[tokenId][msg.sender] = false;
        _posts[tokenId].likesCount--;

        // Emit event
        emit PostUnliked(tokenId, msg.sender);
    }

    /**
     * @dev Checks if a user has liked a post
     * @param tokenId ID of the post
     * @param user Address of the user
     * @return true if the user has liked the post
     */
    function hasLiked(
        uint256 tokenId,
        address user
    ) public view returns (bool) {
        return _likes[tokenId][user];
    }

    /**
     * @dev Gets the post data
     * @param tokenId ID of the post
     * @return post data
     */
    function getPost(uint256 tokenId) public view returns (Post memory) {
        require(_exists(tokenId), "Post does not exist");
        return _posts[tokenId];
    }

    /**
     * @dev Gets all posts by a user
     * @param user Address of the user
     * @return array of post IDs
     */
    function getUserPosts(address user) public view returns (uint256[] memory) {
        return _userPosts[user];
    }

    /**
     * @dev Gets the total number of posts
     * @return total number of posts
     */
    function getTotalPosts() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Gets a range of posts, useful for pagination
     * @param start Start index
     * @param count Number of posts to retrieve
     * @return array of post IDs
     */
    function getPosts(
        uint256 start,
        uint256 count
    ) public view returns (uint256[] memory) {
        require(
            start > 0 && start <= _tokenIds.current(),
            "Invalid start index"
        );

        // Adjust count if necessary
        if (start + count - 1 > _tokenIds.current()) {
            count = _tokenIds.current() - start + 1;
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = start + i;
        }

        return result;
    }
}
