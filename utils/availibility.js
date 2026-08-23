const { readJSON, writeJSON } = require('./db');
const CARS_FILE = require('path').join(__dirname, '../data/cars.json');

class AvailabilityMap {
  constructor() {
    this._map = new Map();
  }

  hydrate() {
    const cars = readJSON(CARS_FILE);
    this._map.clear();
    for (const car of cars) {
      this._map.set(car.id, car.available);
    }
    console.log(`[AvailabilityMap] Hydrated with ${this._map.size} cars.`);
  }

  isAvailable(carId) {
    return this._map.get(carId) === true;
  }

  setAvailability(carId, available) {
    this._map.set(carId, available);

    const cars = readJSON(CARS_FILE);
    const car  = cars.find(c => c.id === carId);
    if (car) {
      car.available = available;
      writeJSON(CARS_FILE, cars);
    }
  }

  add(carId, available = true) {
    this._map.set(carId, available);
  }

  remove(carId) {
    this._map.delete(carId);
  }

  snapshot() {
    return Object.fromEntries(this._map);
  }
}

const availabilityMap = new AvailabilityMap();

module.exports = { AvailabilityMap, availabilityMap };
