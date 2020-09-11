
#export DEBUG="INFO:crownstone* -crownstone-verbose*"
export DEBUG="INFO:crownstone* mongo*"
export DEBUG_HIDE_DATE="false"
export DEBUG_LEVEL="INFO"
export DEBUG_JSON="false"

unbuffer node execute -i ./logs . > >(tee -a ./logs/log.log) 2> >(tee -a ./logs/log.log >&2)
