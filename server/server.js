const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbConfig = require('./config/dbConfig');
const paymentRoute = require('./routes/payments');
const movieRoute = require('./routes/movieRoute');
const uploadRoute = require('./routes/uploadRoute');
const path = require('path');

const app = express();

// Middleware (existing)
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true
}));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/payment', paymentRoute);
app.use('/api/movies', movieRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/admin', require('./routes/adminRoute'));

app.get('/', (req, res) => {
    res.send('API is running... (UPDATEDv3)');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
