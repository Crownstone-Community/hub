#!/bin/bash

export DEBUG="crownstone*"
export DEBUG_HIDE_DATE="false"
export DEBUG_LEVEL="DEBUG"
export DEBUG_JSON="false"
#export CS_HUB_UART_PORT="/dev/ttyUSB0"
export CS_HUB_UART_PORT="/dev/serial/by-id/usb-Silicon_Labs_CP2104_USB_to_UART_Bridge_Controller_014A641C-if00-port0"

crownstone-hub
