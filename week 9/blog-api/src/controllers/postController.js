let posts = [];

// GET all posts
exports.getPosts = (req, res) => {
  res.json(posts);
};

// GET single post
exports.getPostById = (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(post);
};

// CREATE post
exports.createPost = (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required" });
  }

  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    author: req.user.username,
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  res.status(201).json(newPost);
};

// UPDATE post
exports.updatePost = (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.title = req.body.title || post.title;
  post.content = req.body.content || post.content;

  res.json(post);
};

// DELETE post
exports.deletePost = (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  res.json({ message: "Post deleted successfully" });
};
