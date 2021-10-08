let value = 0;

beforeEach(async () => { value = 0; })

let code = `
customHandler = function(val) {
  printer();
  value = val;
}

function printer() {
  console.log("printed a thing");
}
`

function fillTheThing() {
  let customHandler = null
  eval(code)
  return customHandler;
}

test("Eval custom code to see if we can do things with it", async () => {
  let customHandler = null;
  if (customHandler === null) {
    eval(code)
    customHandler(2)
    expect(value).toBe(2);
  }
})

test("Eval custom code with await if it's not a promise", async () => {
  let customHandler = null;
  if (customHandler === null) {
    eval(code)
    await customHandler(3)
    expect(value).toBe(3);
  }
})


test("pass the code around and eval somewhere else.", async () => {
  let customHandler = fillTheThing()
  expect(value).toBe(0);
  let container = () => {
    customHandler(4);
    expect(value).toBe(4);
  }
  container();
})


test("handle an error in the evalled code on execute time", async () => {
  let customHandler;

  let code = `
customHandler = function() { throw new Error("Something went wrong"); console.log("HERE"); }
`
  eval(code)

  try {
    customHandler()
  }
  catch (err) {
    expect(err.message).toBe("Something went wrong")
  }
})

test("handle an error in the evalled code on eval time", async () => {
  let customHandler;
  let code = `
customHandler = function() { throw new Error("Something went wrong"); console.log("HERE"); }

throw new Error("Building")
`
  try {
    eval(code)
  }
  catch (err) {
    expect(err.message).toBe("Building")
  }
})


test("handle an syntax in the evalled code on eval time", async () => {
  let code = `
customHandler = function() { throw new Error("Something went wrong"); console.log("HERE"); }
`
  try {
    eval(code)
  }
  catch (err) {
    expect(err.message).toBe("customHandler is not defined")
  }
})