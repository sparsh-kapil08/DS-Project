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
