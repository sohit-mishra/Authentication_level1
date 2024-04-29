const express = require('express');
require('dotenv').config();
const app = express();
const connectToMongoDB = require('./config/db');

connectToMongoDB();

app.get('/', (req, res)=>{
    res.send('Hello World');
})

app.listen(process.env.PORT, ()=>{
    console.log("Localhost is Working");
})