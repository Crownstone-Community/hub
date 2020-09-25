#!/bin/bash

cd ../..

ARCH=$( uname -m )
echo "Clean: ARCH=$ARCH"

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
        snapcraft clean --use-lxd
else
        snapcraft clean
fi
checkError "snapcraft"

echo "Clean done"
