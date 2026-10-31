
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

const getBooks = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(books), 0);
  });
};

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered' });
});

public_users.get('/', async (req, res) => {
  try {
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const allBooks = await getBooks();
    const book = allBooks[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve book' });
  }
});

public_users.get('/author/:author', async (req, res) => {
  try {
    const allBooks = await getBooks();
    const matches = Object.values(allBooks).filter(book =>
      book.author &&
      book.author.toLowerCase() === req.params.author.toLowerCase()
    );

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

public_users.get('/title/:title', async (req, res) => {
  try {
    const allBooks = await getBooks();
    const matches = Object.values(allBooks).filter(book =>
      book.title &&
      book.title.toLowerCase() === req.params.title.toLowerCase()
    );

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

public_users.get('/review/:isbn', async (req, res) => {
  try {
    const allBooks = await getBooks();
    const book = allBooks[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book.reviews || {});
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve reviews' });
  }
});

module.exports.general = public_users;
