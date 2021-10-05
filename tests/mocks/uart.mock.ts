


export function mockUart() {

  const mockedUartInstance = new mockedUart(null)
  let constructor = function(cloud) { return mockedUartInstance; }

  jest.mock("../../src/crownstone/uart/Uart", () => {
    return {
      Uart: constructor
    }
  })

  return mockedUartInstance;
}

export class mockedUart {
  queue = {};

  __loadedQueue = []
  constructor(cloud) {
    this.queue = { register: async () => {
      if (this.__loadedQueue.length > 0) {
        let value = this.__loadedQueue[0];
        this.__loadedQueue.shift();
        return value;
      }
    }}
  }

  _loadQueue(value, count = 1) {
    for (let i = 0; i < count; i++) {
      this.__loadedQueue.push(value);
    }
  }

  syncFilters = jest.fn()

  _reset() {
    this.__loadedQueue = [];
  }

}