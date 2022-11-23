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



# Getting started.

You have to setup the hub from the app. Make sure you have a Crownstone USB dongle connected to the hub.

You can navigate to the ip address of the hub to interact with it.

# Configuration

There are a number of things you can configure via environmental variables.
```js
// where config is written. Defaults to /dist/util/config
// this config is for deciding whether to show certain endpoints, like logging.
// do. not. touch.
configPath:           process.env.CS_HUB_CONFIG_PATH

// this is where the openssl-hub.conf is found. Defaults to ./config
sslConfigPath:        process.env.CS_HUB_SLL_CONFIG_PATH ?? "config"

// this is where the https cert.pem and key.pem files are written to. Defaults to ./config/https
httpsCertificatePath: process.env.CS_HUB_HTTPS_CERTIFICATE_PATH

// this is which UART port will be used by the hub
uartPort:             process.env.CS_HUB_UART_PORT

// you can disable uart for debugging if you set ENABLE_UART = false
enableUart:           process.env.ENABLE_UART     ?? true

// you can use this for testing if you want custom ids for the db entries.
// do. not. touch.
generateCustomIds:    process.env.GENERATE_CUSTOM_IDS ?? false

// set custom ports for https and http servers instead of the normal ones.
httpsPort:            process.env.PORT      ?? 443
httpPort:             process.env.HTTP_PORT ?? 80
```
All these process.env variables are environmental variables. Use at your own risk.

## Open-source license

This firmware is provided under a noncontagious open-source license towards the open-source community. It's available under three open-source licenses:
 
* License: LGPL v3+, Apache, MIT

<p align="center">
  <a href="http://www.gnu.org/licenses/lgpl-3.0">
    <img src="https://img.shields.io/badge/License-LGPL%20v3-blue.svg" alt="License: LGPL v3" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" />
  </a>
</p>

## Commercial license

This firmware can also be provided under a commercial license. If you are not an open-source developer or are not planning to release adaptations to the code under one or multiple of the mentioned licenses, contact us to obtain a commercial license.

* License: Crownstone commercial license

# Contact

For any question contact us at <https://crownstone.rocks/contact/> or on our discord server through <https://crownstone.rocks/forum/>.
