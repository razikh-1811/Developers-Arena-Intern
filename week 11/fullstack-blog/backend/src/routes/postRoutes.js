const router = require("express").Router();
const auth = require("../middleware/auth");
const { createPost, getPosts, deletePost } = require("../controllers/postController");

router.post("/", auth, createPost);
router.get("/", auth, getPosts);
router.delete("/:id", auth, deletePost);

module.exports = router;
