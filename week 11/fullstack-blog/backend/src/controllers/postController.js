const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  const post = await Post.create({ ...req.body, user: req.userId });
  res.json(post);
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find({ user: req.userId });
  res.json(posts);
};

exports.deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
};
