#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "Release ARCH=$ARCH"

checkError() {
	result=$?
	if [ $result -ne 0 ]; then
		if [ -n "$1" ]; then
			echo "$1 (error code $result)"
		fi
		exit $result
	fi
}

if [ "$ARCH" = "aarch64" ]; then
        snapcraft upload --release edge *_arm64.snap
fi

if [ "$ARCH" = "x86_64" ]; then
        snapcraft upload --release edge *_amd64.snap
fi
checkError "snapcraft"

echo "Release done"
