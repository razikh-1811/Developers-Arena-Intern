const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const socketSetup = require("./socket");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

socketSetup(server);

server.listen(5000, () =>
  console.log("Backend running on port 5000")
);
