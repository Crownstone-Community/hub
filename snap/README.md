# Crownstone hub snap

A snap of the crownstone hub program.

## Installation instructions

The hub expects mongoDB to be installed. A snap version of this will be [maintained](https://github.com/crownstone/crownstone-snaps/), install it with:
```
sudo snap install crownstone-mongo
```

Install crownstone hub:
```
sudo snap install crownstone-hub
```

For now you will have to enable [hotplug](https://snapcraft.io/docs/hotplug-support) manually:
```
sudo snap set system experimental.hotplug=true
```

Now insert the USB stick, or run `sudo systemctl restart snapd`.

And until we are granted auto connect, you will have to connect manually:

Find the name of the serial port:
```
snap interface serial-port
```

Connect the port to the hub program:
```
sudo snap connect crownstone-hub:serial-port snapd:cp2102cp2109uartbrid
```

That's it! The program is started automatically, and the serial port connection will be remembered over reboots.

You can check the logs at: `/var/snap/crownstone-hub/current/debug.log`
