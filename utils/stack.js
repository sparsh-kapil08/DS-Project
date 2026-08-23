class BookingStack {
  constructor() {
    this._data = [];
  }

  push(booking) {
    this._data.push(booking);
  }

  pop() {
    if (this.isEmpty()) return null;
    return this._data.pop();
  }

  peek() {
    if (this.isEmpty()) return null;
    return this._data[this._data.length - 1];
  }

  isEmpty() {
    return this._data.length === 0;
  }

  size() {
    return this._data.length;
  }

  toArray() {
    return [...this._data].reverse();
  }
}

const bookingStack = new BookingStack();

module.exports = { BookingStack, bookingStack };
