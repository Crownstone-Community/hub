

# HubData Request Protocol

Request is what a hub receives via uart. It will reply with the HubData Reply Protocol. 


Type | Name | Length | Description
--- | --- | --- | ---
uint8 | Protocol | 1 | Protocol version of packet (currently 0).
uint16 | RequestType | 2 | Identifies the type of data in the payload.
[uint8] | Payload | Size | Payload data, depends on command type.

## RequestTypes

Value | Name | Encrypted | Payload | Reply (other than error)
--- | --- | --- | --- | ---
| 0  | setup | Never |  SetupPayload | Success
| 1  | command | Depends | tbd | tbd
| 2  | factoryReset | Never | 0xDEADBEEF | Success
| 3  | factoryResetHubOnly | Never | 0xDEADBEA7 | Success
| 10 | requestData | Depends | RequestDataPayload | DataReply

## Payloads

### SetupPayload

Type | Name | Length | Description
--- | --- | --- | ---
uint16 | length | 2 | length of token
[uint8] | token | Size | ascii string as uint8 array
uint16 | length | 2 | length of cloudId
[uint8] | cloudId | Size | ascii string as uint8 array

### RequestDataPayload

Type | Name | Length | Description
--- | --- | --- | ---
uint16 | dataType | 2 | type of data to request.
