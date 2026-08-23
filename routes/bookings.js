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

    const booking = {
      id:         uuidv4(),
      carId,
      userName:   userName.trim(),
      carLabel:   `${car.brand} ${car.model}`,
      startDate,
      endDate,
      days,
      totalCost:  +(car.pricePerDay * days).toFixed(2),
      status:     'confirmed',
      timestamp:  Date.now(),
    };

    const bookings = readJSON(BOOKINGS_FILE);
    bookings.push(booking);
    writeJSON(BOOKINGS_FILE, bookings);

    bookingStack.push(booking);

    availabilityMap.setAvailability(carId, false);

    res.status(201).json({
      status:  'confirmed',
      message: `${car.brand} ${car.model} booked successfully for ${days} day(s)!`,
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  try {
    const bookings = readJSON(BOOKINGS_FILE);
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', (req, res) => {
  res.json({
    count:    bookingStack.size(),
    history:  bookingStack.toArray(),
  });
});

router.delete('/undo', (req, res) => {
  try {
    if (bookingStack.isEmpty()) {
      return res.status(400).json({ error: 'No bookings to undo.' });
    }

    const lastBooking = bookingStack.pop();

    const bookings = readJSON(BOOKINGS_FILE);
    const updated  = bookings.filter(b => b.id !== lastBooking.id);
    writeJSON(BOOKINGS_FILE, updated);

    availabilityMap.setAvailability(lastBooking.carId, true);

    const nextInLine = waitlistManager.dequeue(lastBooking.carId);
    let promoted     = null;

    if (nextInLine) {
      const cars    = readJSON(CARS_FILE);
      const car     = cars.find(c => c.id === lastBooking.carId);
      const days    = Math.max(
        1,
        Math.ceil((new Date(nextInLine.endDate) - new Date(nextInLine.startDate)) / (1000 * 60 * 60 * 24))
      );

      promoted = {
        id:        uuidv4(),
        carId:     nextInLine.carId,
        userName:  nextInLine.userName,
        carLabel:  car ? `${car.brand} ${car.model}` : nextInLine.carId,
        startDate: nextInLine.startDate,
        endDate:   nextInLine.endDate,
        days,
        totalCost: car ? +(car.pricePerDay * days).toFixed(2) : 0,
        status:    'confirmed',
        timestamp: Date.now(),
        promotedFrom: 'waitlist',
      };

      const allBookings = readJSON(BOOKINGS_FILE);
      allBookings.push(promoted);
      writeJSON(BOOKINGS_FILE, allBookings);
      bookingStack.push(promoted);
      availabilityMap.setAvailability(lastBooking.carId, false);
    }
    
    res.json({
      message:   `Booking for ${lastBooking.carLabel} by ${lastBooking.userName} has been undone.`,
      undone:    lastBooking,
      promoted:  promoted || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/waitlist/:carId', (req, res) => {
  const { carId } = req.params;
  const waitlist  = waitlistManager.getWaitlist(carId);

  res.json({
    carId,
    count:     waitlist.length,
    waitlist,
  });
});

module.exports = router;
