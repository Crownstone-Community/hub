

function getMissedMessageCount(currentIndex: number, lastIndex: number) : number {
  let countSize = 256;
  let expected = (lastIndex + 1) % countSize;

  if (currentIndex === expected) {
    return 0;
  }
  else if (currentIndex > expected) {
    return currentIndex - expected;
  }
  else { // if (currentIndex < expected) {
    // we have overflown? Check if the expected is at the upper half
    return currentIndex + countSize - expected;
  }
}



test("MeshStatistics", async () => {
  expect(getMissedMessageCount(1,0)).toBe(0)
  expect(getMissedMessageCount(10,0)).toBe(9)
  expect(getMissedMessageCount(10,120)).toBe(145)
  expect(getMissedMessageCount(0,120)).toBe(135)
})