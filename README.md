# crownstone-hub

The Hub consists of the loopback 4 framework and the crownstone usb.


# Installation

First install the dependencies. Run:

```
yarn
```

Then, you can start the hub program by:

```
node execute.js
```

or

```
npm start
```

or take a look a the provided shell scripts to run the hub with debugging logs.

# Development

If you're working on the hub code, ignore the dist folder completely. This is generated on the fly from the src folder.

Assuming you've already run yarn, you can run:

```
npm run dev
```

to start the typescript compiler in watch mode.