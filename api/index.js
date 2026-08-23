const express = require('express');
const path = require('path');

const carsRouter     = require('../routes/cars');
const bookingsRouter = require('../routes/bookings');
const { availabilityMap } = require('../utils/availability');

const app  = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/cars',     carsRouter);
app.use('/bookings', bookingsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

availabilityMap.hydrate();

module.exports = app;
