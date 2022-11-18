#!/usr/bin/env bash
export SSE_URL="https://events.crownstone.rocks/sse"
export CLOUD_V1_URL="https://cloud.crownstone.rocks/api/"
export CLOUD_V2_URL="https://next.crownstone.rocks/api/"

export CS_UART_SEARCH_BY_ID="true"
export CS_UART_SEARCH_BY_ID_PATH="/dev/serial/by-id"
export CS_UART_SEARCH_BY_ID_PATTERN="(usb-Silicon_Labs_CP2104_USB_to_UART_Bridge_Controller_.*|.*Crownstone_dongle.*)"

export PORT=443
export HTTP_PORT=80

node execute.js
