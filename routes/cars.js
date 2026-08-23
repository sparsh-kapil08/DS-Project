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
