import { advanceBy, advanceTo, clear } from 'jest-date-mock';
import {mockedUart, mockUart} from './uart.mock';
advanceTo(1e6); // reset to timestamp = 1.000.000

let mockedUartInstance = mockUart()

export const resetMocks = function() {
  advanceTo(1e6);
  mockedUartInstance._reset()
}



export const mocks = {
  date: { advanceBy, advanceTo, clear },
  uart: mockedUartInstance,
  reset: resetMocks
}