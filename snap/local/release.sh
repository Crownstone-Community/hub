#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "Release ARCH=$ARCH"

if [ "$ARCH" = "aarch64" ]; then
        snapcraft upload --release edge *_arm64.snap
fi

if [ "$ARCH" = "x86_64" ]; then
        snapcraft upload --release edge *_amd64.snap
fi
echo "Release done"
