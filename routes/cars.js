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

router.post('/', (req, res) => {
  try {
    const { brand, model, type, location, pricePerDay, rating, mileage, image } = req.body;

    if (!brand || !model || !type || !location || !pricePerDay) {
      return res.status(400).json({ error: 'brand, model, type, location, and pricePerDay are required.' });
    }

    const newCar = {
      id:          uuidv4(),
      brand:       brand.trim(),
      model:       model.trim(),
      type:        type.trim(),
      location:    location.trim(),
      pricePerDay: parseFloat(pricePerDay),
      rating:      parseFloat(rating) || 0,
      mileage:     parseInt(mileage)  || 0,
      available:   true,
      image:       image || `https://placehold.co/300x180/888/white?text=${encodeURIComponent(brand + ' ' + model)}`,
    };

    const cars = readJSON(CARS_FILE);
    cars.push(newCar);
    writeJSON(CARS_FILE, cars);

    availabilityMap.add(newCar.id, true);

    res.status(201).json({ message: 'Car added successfully.', car: newCar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const cars = readJSON(CARS_FILE);
    const idx  = cars.findIndex(c => c.id === req.params.id);

    if (idx === -1) return res.status(404).json({ error: 'Car not found.' });

    const allowed = ['brand', 'model', 'type', 'location', 'pricePerDay', 'rating', 'mileage', 'available', 'image'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        cars[idx][field] = req.body[field];
      }
    });

    writeJSON(CARS_FILE, cars);

    if (req.body.available !== undefined) {
      availabilityMap.add(req.params.id, req.body.available);
    }

    res.json({ message: 'Car updated successfully.', car: cars[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const cars    = readJSON(CARS_FILE);
    const idx     = cars.findIndex(c => c.id === req.params.id);

    if (idx === -1) return res.status(404).json({ error: 'Car not found.' });

    const [removed] = cars.splice(idx, 1);
    writeJSON(CARS_FILE, cars);

    availabilityMap.remove(removed.id);

    res.json({ message: 'Car deleted successfully.', car: removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
