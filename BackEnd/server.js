const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");


const app = express();


app.use(cors({
    origin: "http://127.0.0.1:5500"
}));

app.use(bodyParser.json());


mongoose.connect("mongodb://localhost:27017/GameDB")

.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

//Schema
const userSchema = new mongoose.Schema({
    nickname: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 6 },
});

const User = mongoose.model("User", userSchema);

app.get("/proxy-banana", async (req, res) => {
    try {
        const response = await axios.get("http://marcconrad.com/uob/banana/api.php?out=json");
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching Banana API:", error);
        res.status(500).json({ error: "Failed to fetch Banana API" });
    }
});

// Signup 
app.post("/signup", async (req, res) => {
    try {
        const { nickname, password } = req.body;

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

    
        const existingUser = await User.findOne({ nickname });
        if (existingUser) {
            return res.status(400).json({ error: "Nickname is already taken." });
        }

        const newUser = new User({ nickname, password });
        await newUser.save();

        res.json({ message: "Signup successful!", nickname });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login 
app.post("/login", async (req, res) => {
    try {
        const { nickname, password } = req.body;

        const user = await User.findOne({ nickname });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: "Invalid nickname or password." });
        }

        res.json({ message: "Login successful!", nickname });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Check Session
app.get("/session", (req, res) => {
    
    res.json({ nickname: req.query.nickname || "Guest" });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
