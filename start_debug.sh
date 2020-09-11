
export DEBUG="crownstone*"
export DEBUG_HIDE_DATE="false"
export DEBUG_LEVEL="DEBUG"
export DEBUG_JSON="false"

unbuffer node execute.js -i ./logs . > >(tee -a ./logs/logDebug.log) 2> >(tee -a ./logs/logDebug.log >&2)
