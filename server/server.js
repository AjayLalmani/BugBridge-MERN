const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected successfully");
  })
  .catch((err) => console.log("Failed to connect : ", err));

app.listen(PORT, () => {
  console.log("working at port ",PORT);
});

app.get("/", (req, res) => {
  res.send("Working");
});
