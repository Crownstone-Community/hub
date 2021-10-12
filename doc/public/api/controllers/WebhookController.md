# WebhookController

To allow certain events that happen in the mesh network to be sent out to external devices, this WebhookController was born.

WebhookController

#### POST: /webhooks
> `admin authorization required`
> Create a new webhook. You have to provide a Webhook datamodel.
> ```
> Webhook
>   {
>      "event":                 string,   // "ASSET_REPORT". Details below.
>      "clientSecret":          string,   // string that is included in each request. Can be used to authenticate.
>      "endPoint":              string,   // URL to sent the data to as a POST request.
>      "compressed":            boolean,  // this will reduce the size of the request payload.
>      "customHandler":         string,   // This can be plain javascript code, which will be evalled to handle the data upload.
>      "batchTimeSeconds":      number,   // combine events that come in over X seconds into 1 request. 
>      "apiKey":                string,   // optional, API key used to authenticate the request
>      "apiKeyHeader":          string    // optional, header string to contain the API key ("apiKey" for instance)
>   }
>```

#### GET: /webhooks
> `authorization required`
> Get a list of all registered webhooks
#### DELETE: /webhooks/all
> `admin authorization required`
> Delete all webhooks
#### DELETE: /webhooks/{id}
> `admin authorization required`
> Delete a specific webhook


## Request Payload

The request is a POST request to the endpoint. If an API key is provided, it will contain a header:
```
{ apiKeyHeader || "apiKey" : apiKey }
```

The payload is JSON with the following format:
```
{
    event:        string,
    clientSecret: string,
    data:         event-specific-data,
    timestamp:    number // Date.now()
}
```

Event specific data is below.

## Events

### ASSET_REPORT

The ASSET_REPORT event is fired when a received measurement from the mesh network regarding an Asset with OutputDescription `OutputDescription_mac_report` has been received.
If you don't know what that means, take a look at the [AssetController documentation](./AssetController.md).

The event-specific-data of this event is:
```
(uncompressed)
{
    crownstoneId:         number,   // shortUid
    crownstoneMacAddress: string,   // ie. "E5:94:DD:2E:B0:63"
    assetMacAddress:      string,   // ie. "E5:94:DD:2E:B0:63"
    assetRssi:            number,   // ie. -63
    rssiChannel:          number,   // 37, 38 or 39
    timestamp:            number    // timestamp
}

(compressed)
{
    cid: number,   // shortUid
    cm:  string,   // ie. "E5:94:DD:2E:B0:63"
    am:  string,   // ie. "E5:94:DD:2E:B0:63"
    r:   number,   // ie. -63
    c:   number,   // 37, 38 or 39
    t:   number    // timestamp
}
```


# Custom Handler

You can write your own custom handler to handle the uploading of the asset data to your own server. This is plain javascript code which will be evaluated to handle the data.

This is done by starting with `customHandler = ...` in your code. The hub will just call the customHandler with the webhook database entry ad the data. 

```js
/**
 * This is the main handler. You're provided with the webhook you configured, which you can use if you want.
 * This function should do the request.
 *
 *
 * @param webhook  | this is a webhook from the database
 *     {
 *      "event":                 string,   // "ASSET_REPORT". Details below.
 *      "clientSecret":          string,   // string that is included in each request. Can be used to authenticate.
 *      "endPoint":              string,   // URL to sent the data to as a POST request.
 *      "compressed":            boolean,  // this will reduce the size of the request payload.
 *      "batchTimeSeconds":      number,   // combine events that come in over X seconds into 1 request.
 *      "apiKey":                string,   // optional, API key used to authenticate the request
 *      "apiKeyHeader":          string    // optional, header string to contain the API key ("apiKey" for instance)
 *     }
 * @param data | this is an array of webhookDataType classes (currently only AssetReportWebhookData)
 */
customHandler = async function(webhook, data) {
  await send(data);
}
```

If you throw an error in your customHandler, it will be shown as the customHandlerIssue as part of the webhook datamodel.

You can see a few examples of customHandlers [here](./webhookCustomHandler/customHandlerSmallExample.js) and [here](./webhookCustomHandler/customHttpsHandlerExample.js).