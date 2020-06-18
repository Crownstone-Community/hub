# Bluenet

This module will listen to the UART coming in from the dongle. It will be in charge of sending and receiving mesh messages.

It will also handle the setup and factory reset will trigger events on the relevant other modules.

### Setup

On setup, the hub will receive it's token. Using this token it can login to the cloud and get it's data.

All the other modules will wait on the Bluenet module to tell them it is OK to start. This is done in the module Index.

### Factory reset

When the hub has been powered on for at least 5 minutes (will be tracked by Bluenet), and the USB dongle is disconnected (there is a need for a ping-pong here perhaps?) and reconnected within 10 seconds, 
the hub will tell the dongle it is OK to allow factory reset. 

The phone can then tell the dongle to factory reset. It will propagate this to the hub and the hub will destroy the local data stores, keys and everything user related. Finally it will reset the hub.