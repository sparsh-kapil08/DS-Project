const express  = require('express');
const { v4: uuidv4 } = require('uuid');
const router   = express.Router();

const { readJSON, writeJSON } = require('../utils/db');
const { availabilityMap }     = require('../utils/availability');
const { waitlistManager }     = require('../utils/queue');
const { bookingStack }        = require('../utils/stack');

const BOOKINGS_FILE = require('path').join(__dirname, '../data/bookings.json');
const CARS_FILE     = require('path').join(__dirname, '../data/cars.json');

router.post('/', (req, res) => {
  try {
    const { carId, userName, startDate, endDate } = req.body;

    if (!carId || !userName || !startDate || !endDate) {
      return res.status(400).json({
        error: 'carId, userName, startDate, and endDate are required.',
      });
    }

    const cars = readJSON(CARS_FILE);
    const car  = cars.find(c => c.id === carId);
    if (!car) return res.status(404).json({ error: 'Car not found.' });

    const available = availabilityMap.isAvailable(carId);

    if (!available) {
      const waitEntry = {
        id:        uuidv4(),
        carId,
        userName:  userName.trim(),
        startDate,
        endDate,
        queuedAt:  new Date().toISOString(),
      };
      waitlistManager.enqueue(carId, waitEntry);

      return res.status(200).json({
        status:        'waitlisted',
        message:       `${car.brand} ${car.model} is currently unavailable. You've been added to the waitlist.`,
        position:      waitlistManager.count(carId),
        waitlistEntry: waitEntry,
      });
    }

    const days = Math.max(
      1,
      Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    );
