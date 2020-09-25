#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "Build: ARCH=$ARCH"

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
        snapcraft --use-lxd
else
        snapcraft
fi
checkError "snapcraft"

echo "Build done"
