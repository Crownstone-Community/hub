#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "Clean: ARCH=$ARCH"

if [ "$ARCH" = "aarch64" ]; then
        snapcraft clean --use-lxd
else
        snapcraft clean
fi
echo "Clean done"
