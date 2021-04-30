import { advanceBy, advanceTo, clear } from 'jest-date-mock';
advanceTo(1e6); // reset to timestamp = 1.000.000


export const resetMocks = function() {
  advanceTo(1e6);
}

export const mocks = {
  date: { advanceBy, advanceTo, clear },
  reset: resetMocks
}