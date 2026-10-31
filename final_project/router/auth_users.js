
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(
        (user) => user.username === username && user.password === password
    );
};

regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username }, 'fingerprint_customer', {
        expiresIn: '1h'
    });

    req.session.authorization = {
        accessToken: token,
        username: username
    };

    return res.status(200).json({ message: 'Login successful', token: token });
});

regd_users.put('/auth/review/:isbn', (req, res) => {
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: 'Please log in first' });
    }

    const isbn = req.params.isbn;
    const review = req.body.review;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (!review) {
        return res.status(400).json({ message: 'Review is required' });
    }

    book.reviews[username] = review;

    return res.status(200).json({
        message: 'Review added successfully',
        reviews: book.reviews
    });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
    const username = req.session.authorization?.username;
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!username) {
        return res.status(401).json({ message: 'Please log in first' });
    }

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.reviews[username]) {
        return res.status(404).json({ message: 'You have not reviewed this book' });
    }

    delete book.reviews[username];

    return res.status(200).json({ message: 'Review deleted successfully' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
