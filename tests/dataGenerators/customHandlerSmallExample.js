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


// --------------- REQUIRED MODULES ---------------- //

// you can include nodejs-native modules here too!
const http = require('http');

// --------------------- MAKE REQUEST ---------------- //

async function send(data) {
  return new Promise((resolve, reject) => {
    let stringifiedData = JSON.stringify(data);
    let options = {
      host: '127.0.0.1',
      path: '/',
      port:  5000,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': stringifiedData.length
      }
    };

    const req = http.request(options, (res) => {
      // logs are only used for testing, not in the code itself.
      // console.log(`statusCode: ${res.statusCode}`, Date.now())
      let str = '';
      res.on('data', function(chunk) {
        str += chunk;
      })
      res.on('end', function() {
        // logs are only used for testing, not in the code itself.
        // console.log(str);
        resolve();
      })
    })

    req.on('error', error => {
      // logs are only used for testing, not in the code itself.
      // console.error(error);
    })

    req.write(stringifiedData)
    req.end()
  })
};
