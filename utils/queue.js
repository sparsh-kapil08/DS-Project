class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class WaitlistQueue {
  constructor() {
    this.head  = null;
    this.tail  = null;
    this._size = 0;
  }

  enqueue(item) {
    const node = new Node(item);
    if (this.tail) {
      this.tail.next = node;
    }
    this.tail = node;
    if (!this.head) {
      this.head = node;
    }
    this._size++;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const data  = this.head.data;
    this.head   = this.head.next;
    if (!this.head) this.tail = null;
    this._size--;
    return data;
  }

  peek() {
    return this.head ? this.head.data : null;
  }

  isEmpty() {
    return this._size === 0;
  }

  size() {
    return this._size;
  }

  toArray() {
    const arr = [];
    let cur   = this.head;
    while (cur) {
      arr.push(cur.data);
      cur = cur.next;
    }
    return arr;
  }
}

class WaitlistManager {
  constructor() {
    this.queues = new Map();
  }

  _ensure(carId) {
    if (!this.queues.has(carId)) {
      this.queues.set(carId, new WaitlistQueue());
    }
  }

  enqueue(carId, userEntry) {
    this._ensure(carId);
    this.queues.get(carId).enqueue(userEntry);
  }

  dequeue(carId) {
    if (!this.queues.has(carId)) return null;
    return this.queues.get(carId).dequeue();
  }

  getWaitlist(carId) {
    if (!this.queues.has(carId)) return [];
    return this.queues.get(carId).toArray();
  }

  count(carId) {
    if (!this.queues.has(carId)) return 0;
    return this.queues.get(carId).size();
  }
}

const waitlistManager = new WaitlistManager();

module.exports = { WaitlistQueue, WaitlistManager, waitlistManager };
