function insertionSort(arr, key, order = 'asc') {
  const copy = [...arr];
  for (let i = 1; i < copy.length; i++) {
    const current = copy[i];
    let j = i - 1;
    while (j >= 0) {
      const cmp = order === 'desc'
        ? copy[j][key] < current[key]
        : copy[j][key] > current[key];
      if (cmp) {
        copy[j + 1] = copy[j];
        j--;
      } else {
        break;
      }
    }
    copy[j + 1] = current;
  }
  return copy;
}
