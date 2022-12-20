#!/bin/bash

export DEBUG="crownstone*"
export DEBUG_HIDE_DATE="false"
export DEBUG_LEVEL="INFO"
export DEBUG_JSON="false"

#unbuffer node execute.js -i ./logs . > >(tee -a ./logs/log.log) 2> >(tee -a ./logs/log.log >&2)
node run.js
