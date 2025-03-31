const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const path = require("path");


const app = express();
const SECRET_KEY = "12345";

app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

//Connect to MongoDB
mongoose.connect("mongodb+srv://Sanuda:12345@cluster0.wfw25.mongodb.net/GameDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

//User Schema
const userSchema = new mongoose.Schema({
    nickname: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 6 }
});
const User = mongoose.model("User", userSchema);

//Score Schema
const scoreSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    time: { type: Number, required: true },
    difficulty: { type: Number, required: true }
});
scoreSchema.index({ nickname: 1, difficulty: 1 }, { unique: true });
const Score = mongoose.model("Score", scoreSchema);
module.exports = Score;

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { nickname, password } = req.body;
        if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters long." });

        const existingUser = await User.findOne({ nickname });
        if (existingUser) return res.status(400).json({ error: "Nickname is already taken." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ nickname, password: hashedPassword });
        await newUser.save();

        res.json({ message: "Signup successful!" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login Route (JWT Authentication)
app.post("/login", async (req, res) => {
    try {
        const { nickname, password } = req.body;
        const user = await User.findOne({ nickname });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid nickname or password." });
        }

        const token = jwt.sign({ nickname }, SECRET_KEY, { expiresIn: "24h" });
        res.json({ message: "Login successful!", token });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Verify Token
function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = decoded;
        next();
    });
}

//Get User Info
app.get("/session", verifyToken, (req, res) => {
    res.json({ nickname: req.user.nickname });
});

// Save Score (Only if user is logged in)
app.post("/save-score", verifyToken, async (req, res) => {
    try {
        const { time, difficulty } = req.body;
        const nickname = req.user.nickname;

        if (!time || !difficulty) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const difficultyNumber = parseInt(difficulty);

        const existingScore = await Score.findOne({ nickname, difficulty: difficultyNumber });

        if (!existingScore || time < existingScore.time) {
           
            await Score.findOneAndUpdate(
                { nickname, difficulty: difficultyNumber }, 
                { $set: { time } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        res.json({ message: "Score saved successfully!" });
    } catch (error) {
        console.error("❌ Error saving score:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Leaderboard
app.get("/leaderboard", async (req, res) => {
    try {
        const { difficulty } = req.query;
        let query = {};
        
        if (difficulty && difficulty !== "all") {
            query.difficulty = parseInt(difficulty);
        }

        const leaderboard = await Score.find(query).sort({ time: 1 });
        res.json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/proxy-banana", async (req, res) => {
    try {
        const response = await axios.get("http://marcconrad.com/uob/banana/api.php?out=json");
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching Banana API:", error);
        res.status(500).json({ error: "Failed to fetch Banana API" });
    }
});


//Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
