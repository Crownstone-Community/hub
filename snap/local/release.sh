#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "ARCH: $ARCH"

if [ "$ARCH" = "aarch64" ]; then
#        snapcraft upload --release edge *_arm64.snap
        snapcraft upload *_arm64.snap
fi

if [ "$ARCH" = "x86_64" ]; then
#        snapcraft upload --release edge *_amd64.snap
        snapcraft upload *_amd64.snap
fi
