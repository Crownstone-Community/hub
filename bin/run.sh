#!/bin/bash

export CS_HUB_UART_PORT="$( ls /dev/serial/by-id/usb-Silicon_Labs_CP2104_USB_to_UART_Bridge_Controller_* )"
$SNAP/bin/node $SNAP/execute.js >> $SNAP_DATA/debug.log 2>&1
