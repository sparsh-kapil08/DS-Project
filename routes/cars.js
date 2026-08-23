const express  = require('express');
const { v4: uuidv4 } = require('uuid');
const router   = express.Router();

const { readJSON, writeJSON }   = require('../utils/db');
const { linearSearch, binarySearch } = require('../utils/search');
const { insertionSort, quickSort }  = require('../utils/sort');
const { availabilityMap }       = require('../utils/availability');

const CARS_FILE = require('path').join(__dirname, '../data/cars.json');

router.get('/', (req, res) => {
  try {
    let cars = readJSON(CARS_FILE);

    const { sort, order = 'asc', algo = 'insertion' } = req.query;

    const keyMap = {
      price:   'pricePerDay',
      rating:  'rating',
      mileage: 'mileage',
    };

    if (sort && keyMap[sort]) {
      const key = keyMap[sort];
      cars = algo === 'quick'
        ? quickSort(cars, key, order)
        : insertionSort(cars, key, order);
    }

    res.json({
      count: cars.length,
      algorithm: sort ? (algo === 'quick' ? 'Quick Sort' : 'Insertion Sort') : null,
      sortedBy: sort || null,
      order: sort ? order : null,
      cars,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query param "q" is required.' });

    const cars    = readJSON(CARS_FILE);
    const results = linearSearch(cars, q);

    res.json({
      query: q,
      algorithm: 'Linear Search',
      count: results.length,
      cars: results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search/price', (req, res) => {
  try {
    const maxPrice = parseFloat(req.query.maxPrice);
    if (isNaN(maxPrice)) {
      return res.status(400).json({ error: 'Query param "maxPrice" must be a number.' });
    }

    const cars       = readJSON(CARS_FILE);
    const sorted     = insertionSort(cars, 'pricePerDay', 'asc');
    const results    = binarySearch(sorted, maxPrice);

    res.json({
      maxPrice,
      algorithm: 'Insertion Sort → Binary Search',
      count: results.length,
      cars: results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
