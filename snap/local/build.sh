#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "ARCH: $ARCH"

if [ "$ARCH" = "aarch64" ]; then
        snapcraft --use-lxd
else
        snapcraft
fi

