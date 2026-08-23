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

function partition(arr, lo, hi, key, order) {
  const pivotVal = arr[hi][key];
  let i = lo - 1;

  for (let j = lo; j < hi; j++) {
    const cmp = order === 'desc'
      ? arr[j][key] >= pivotVal
      : arr[j][key] <= pivotVal;

    if (cmp) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
  return i + 1;
}

function quickSortHelper(arr, lo, hi, key, order) {
  if (lo < hi) {
    const pi = partition(arr, lo, hi, key, order);
    quickSortHelper(arr, lo,     pi - 1, key, order);
    quickSortHelper(arr, pi + 1, hi,     key, order);
  }
}

function quickSort(arr, key, order = 'asc') {
  const copy = [...arr];
  quickSortHelper(copy, 0, copy.length - 1, key, order);
  return copy;
}

module.exports = { insertionSort, quickSort };
