const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["https://final-iota-beige.vercel.app/" , "http://localhost:3000"] ,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);
mongoose.connect(
  "mongodb+srv://admin:admin@e-commerce.out66nk.mongodb.net/?retryWrites=true&w=majority&appName=e-commerce"
)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("MongoDB connection error:", err));
const userRoutes = require("./userRoutes");
app.use("/api", userRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});