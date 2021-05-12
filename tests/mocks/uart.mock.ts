


export function mockUart() {
  jest.mock("../../src/crownstone/uart/Uart", () => {
    return {
      Uart: mockedUart
    }
  })
}

class mockedUart {
  constructor(cloud) {}
  syncFilters = jest.fn()
}