const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST upload
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
        }

        // Return URL (assuming server is on localhost:5000)
        // We will store just the relative path or full URL. Usually storing path is better if domain changes.
        // But for simplicity in frontend, let's return a usable relative path.
        const imageUrl = `/uploads/${req.file.filename}`;

        res.json({ status: "ok", imageUrl: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Upload failed" });
    }
});

module.exports = router;
