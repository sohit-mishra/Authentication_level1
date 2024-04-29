const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URI;

const connectToMongoDB = () => {
    mongoose.connect(url)
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((error) => {
            console.log('Failed to connect to MongoDB:', error.message);
        });
};

module.exports = connectToMongoDB;
