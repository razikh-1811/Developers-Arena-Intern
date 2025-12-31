const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/database");
const userController = require("./src/controllers/userController");
const taskController = require("./src/controllers/taskController");
const auth = require("./src/middleware/auth");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Auth routes
app.post("/api/register", userController.register);
app.post("/api/login", userController.login);

// Task routes
app.post("/api/tasks", auth, taskController.createTask);
app.get("/api/tasks", auth, taskController.getTasks);
app.put("/api/tasks/:id", auth, taskController.updateTask);
app.delete("/api/tasks/:id", auth, taskController.deleteTask);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
