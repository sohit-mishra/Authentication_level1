const express = require('express');
require('dotenv').config();
const app = express();
const connectToMongoDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./model/User');
const Product = require('./model/Product');
const bcrypt = require('bcrypt');
app.use(express.json());


const Authentication = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRETKEY , function(err, decoded) {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ error: "Unauthorized" });
        } else {
            next();
        }
    });
}

connectToMongoDB();

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.post('/signup', async (req, res) => {
    console.log(req.body);
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        console.log(newUser);
        await newUser.save();

        res.status(201).json({ message: "User signed up successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRETKEY, { expiresIn: '1h' });
       
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/product', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/product', Authentication, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/update/:id', Authentication, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/delete/:id', Authentication, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(process.env.SECRETKEY);
    console.log(`Server is running on port ${PORT}`);
});
