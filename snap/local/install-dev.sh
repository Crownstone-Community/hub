#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "ARCH: $ARCH"

if [ "$ARCH" = "aarch64" ]; then
        sudo snap install --devmode *_arm64.snap
fi

if [ "$ARCH" = "x86_64" ]; then
        sudo snap install --devmode *_amd64.snap
fi
