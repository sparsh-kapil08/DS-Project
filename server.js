const express = require('express');
const path    = require('path');

const carsRouter     = require('./routes/cars');
const bookingsRouter = require('./routes/bookings');
const { availabilityMap } = require('./utils/availability');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/cars',     carsRouter);
app.use('/bookings', bookingsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});