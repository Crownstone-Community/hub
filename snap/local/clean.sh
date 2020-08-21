#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "ARCH: $ARCH"

if [ "$ARCH" = "aarch64" ]; then
        snapcraft clean --use-lxd
else
        snapcraft clean
fi

