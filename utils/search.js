function linearSearch(cars, query, fields = ['brand', 'model', 'type', 'location']) {
  const q = query.trim().toLowerCase();
  const results = [];

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    for (let f = 0; f < fields.length; f++) {
      const fieldVal = String(car[fields[f]] || '').toLowerCase();
      if (fieldVal.includes(q)) {
        results.push(car);
        break;
      }
    }
  }

  return results;
}

function binarySearch(sortedCars, maxPrice) {
  let lo  = 0;
  let hi  = sortedCars.length - 1;
  let ans = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (sortedCars[mid].pricePerDay <= maxPrice) {
      ans = mid;
      lo  = mid + 1;
    } else {
      hi  = mid - 1;
    }
  }

  return ans === -1 ? [] : sortedCars.slice(0, ans + 1);
}

module.exports = { linearSearch, binarySearch };
