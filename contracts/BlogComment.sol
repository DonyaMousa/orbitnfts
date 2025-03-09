// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BlogPost.sol";

contract BlogComment is Ownable {
    // Reference to the BlogPost contract
    BlogPost private _blogPost;

    // Structure to hold comment data
    struct Comment {
        uint256 id;
        uint256 postId;
        address commenter;
        string content;
        uint256 timestamp;
        uint256 likesCount;
    }

    // Comment counter
    uint256 private _commentIdCounter;

    // Mapping from postId to comment IDs
    mapping(uint256 => uint256[]) private _postComments;

    // Mapping from commentId to Comment
    mapping(uint256 => Comment) private _comments;

    // Mapping for likes: commentId => user => liked
    mapping(uint256 => mapping(address => bool)) private _commentLikes;

    // Events
    event CommentAdded(
        uint256 indexed commentId,
        uint256 indexed postId,
        address indexed commenter
    );
    event CommentLiked(uint256 indexed commentId, address indexed liker);
    event CommentUnliked(uint256 indexed commentId, address indexed unliker);

    constructor(address blogPostAddress) {
        _blogPost = BlogPost(blogPostAddress);
    }

    /**
     * @dev Adds a comment to a blog post
     * @param postId ID of the post to comment on
     * @param content Content of the comment
     * @return commentId of the newly added comment
     */
    function addComment(
        uint256 postId,
        string memory content
    ) public returns (uint256) {
        // Verify post exists
        require(
            _blogPost.getPost(postId).isPublished,
            "Post does not exist or is not published"
        );

        // Increment comment ID
        _commentIdCounter++;
        uint256 commentId = _commentIdCounter;

        // Create comment
        _comments[commentId] = Comment(
            commentId,
            postId,
            msg.sender,
            content,
            block.timestamp,
            0
        );

        // Add to post's comments
        _postComments[postId].push(commentId);

        // Emit event
        emit CommentAdded(commentId, postId, msg.sender);

        return commentId;
    }

    /**
     * @dev Likes a comment
     * @param commentId ID of the comment to like
     */
    function likeComment(uint256 commentId) public {
        require(
            commentId <= _commentIdCounter && commentId > 0,
            "Comment does not exist"
        );
        require(!_commentLikes[commentId][msg.sender], "Comment already liked");

        // Add like
        _commentLikes[commentId][msg.sender] = true;
        _comments[commentId].likesCount++;

        // Emit event
        emit CommentLiked(commentId, msg.sender);
    }

    /**
     * @dev Unlikes a comment
     * @param commentId ID of the comment to unlike
     */
    function unlikeComment(uint256 commentId) public {
        require(
            commentId <= _commentIdCounter && commentId > 0,
            "Comment does not exist"
        );
        require(_commentLikes[commentId][msg.sender], "Comment not liked yet");

        // Remove like
        _commentLikes[commentId][msg.sender] = false;
        _comments[commentId].likesCount--;

        // Emit event
        emit CommentUnliked(commentId, msg.sender);
    }

    /**
     * @dev Checks if a user has liked a comment
     * @param commentId ID of the comment
     * @param user Address of the user
     * @return true if the user has liked the comment
     */
    function hasLikedComment(
        uint256 commentId,
        address user
    ) public view returns (bool) {
        return _commentLikes[commentId][user];
    }

    /**
     * @dev Gets a comment
     * @param commentId ID of the comment
     * @return comment data
     */
    function getComment(
        uint256 commentId
    ) public view returns (Comment memory) {
        require(
            commentId <= _commentIdCounter && commentId > 0,
            "Comment does not exist"
        );
        return _comments[commentId];
    }

    /**
     * @dev Gets all comments for a post
     * @param postId ID of the post
     * @return array of comment IDs
     */
    function getPostComments(
        uint256 postId
    ) public view returns (uint256[] memory) {
        return _postComments[postId];
    }

    /**
     * @dev Gets the total number of comments
     * @return total number of comments
     */
    function getTotalComments() public view returns (uint256) {
        return _commentIdCounter;
    }

    /**
     * @dev Updates the BlogPost contract reference
     * @param blogPostAddress Address of the BlogPost contract
     */
    function updateBlogPostAddress(address blogPostAddress) public onlyOwner {
        _blogPost = BlogPost(blogPostAddress);
    }
}
