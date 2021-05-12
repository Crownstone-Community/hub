import { advanceBy, advanceTo, clear } from 'jest-date-mock';
import {mockUart} from './uart.mock';
advanceTo(1e6); // reset to timestamp = 1.000.000


export const resetMocks = function() {
  advanceTo(1e6);
}


mockUart()

export const mocks = {
  date: { advanceBy, advanceTo, clear },
  reset: resetMocks
}