# Architecture explanation

The cloud V2 is made in typescript and used the Loopback 4 framework. Most of the design is based on loopback 4's preferences.

Look at the Loopback 4 documentation to learn about controllers, models, repositories and the application. This document is meant as a who-is-who for experienced developers who already read the loopback documentation.

The hub code has been written after the Cloud V2, and a lot of the design decisions follow those of the cloud v2.

There is documentation available over at the /doc folder for the endpoints, developer endpoints and more.

The hub code makes heavy use of the Crownstone nodejs libraries. They have been developed mainly for this usecase.

# Entrypoint

The hub code is started via the execute.js in the root of the project. Using environmental variables, you can set certain configurations.

# DbReference

(RepoContainer in cloudV2)

Path: `/src/modules/data/DbReference`

Instead of injecting the repositories needed for each controller, I prefer to have a global object which we can import from anywhere which contains all repositories. This is the DbReference, called `Dbs`.

# Setup

You have to setup the hub via the Crownstone consumer application. This goes via the USB dongle.

# REST Endpoints and Background processes

A part of the hub consists of REST endpoints, configured via the controllers (as per loopback 4). These can trigger actions when called.

There are a number of different background processes in the application:

### SSE

Server sent events from the Crownstone SSE server can trigger actions on the hub. Used to switch Crownstones, trigger a sync when a Crownstone is added and handle token expiration.

### UART

A lot of data is coming in from the Crownstone Mesh via the USB dongle. The USB dongle is required for the hub to work. Data coming from the mesh is cached:

- Energy data
- Switch state
- Topology

The energy data can be viewed by the ```https://<url>/energyViewer``` dashboard. This is very much a developer dashboard. 

Additionally, if the user has giver permission to upload the data to the cloud, this data will also be uploaded to the cloud every minute.

### Cloud syncing

Finally, the hub also keeps an in-memory map of Crownstones, locations and users from the cloud. It updates the cloud with its local IP address every 15 minutes (and on change). 

## CrownstoneHub.ts

The main logic component that manages the uart, cloud and commands is the CrownstoneHubClass, located in the /src/modules/CrownstoneHub.ts

# Hub protocol

We wanted to have a protocol to communicate between the app and the hub without the firmware having to be updated for any changes. This protocol is implemented on the app side and the hub side. The phone would connect to 
the usb dongle with a command to print a buffer over uart, which is then read by the hub.

# Security

We needed to have a way to set permissions on the hub based on the cloud roles of users in the sphere. We have decided to use something called a sphereAuthorizationToken. These are given to the user
via the cloud (user/id/keysV2). The hubs can download a map between these tokens and the permissions the user has. These tokens are cycled when a hub is added/removed or when a user is removed or added to the sphere.



