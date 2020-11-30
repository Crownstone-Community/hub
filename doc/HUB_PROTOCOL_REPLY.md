

# HubData Reply Protocol

Reply is how the hub responds to the request it received via uart.

Type | Name | Length | Description
--- | --- | --- | ---
uint8 | Protocol | 1 | Protocol version of packet (currently 0)
uint16 | ReplyType | 2 | Identifies the type of data in the payload
[uint8] | Payload | Size | Payload data, depends on command type.

## ReplyTypes

Value | Name |  Payload
--- | --- | ---
| 0 | Success | SuccessPayload |
| 10 | DataReply | DataReplyPayload |
| 4000 | Error | ErrorPayload |

## Payloads

### SuccessPayload

Type | Name | Length | Description
--- | --- | --- | ---
uint16 | length | 2 | length of message
[uint8] | message | length | ascii string message (optional)


### DataReplyPayload

Type | Name | Length | Description
--- | --- | --- | ---
uint16 | dataType | 2 | Type of requested data
uint16 | length | 2 | length of message
[uint8] | data | length | ByteArray of requested data. Formatting depends on data type

#### DataTypes

Value | Name | Formatting
--- | ---  | ----
0 | CloudId | Ascii string

### ErrorPayload

Type | Name | Length | Description
--- | --- | --- | ---
uint16 | ErrorCode | code of the error |
uint16 | length | 2 | length of message
[uint8] | message | Size | ascii string message (optional)


#### Error codes:

Value | Name |  Description
--- | --- | ---
| 0 | SETUP_FAILED_NOT_IN_SETUP_MODE | This hub is not in setup mode |
| 1 | SETUP_FAILED_INVALID_TOKEN | The provided token (or cloud id) is incorrect. |
| 2 | SETUP_FAILED_UNKNOWN       | Something else went wrong.. |
