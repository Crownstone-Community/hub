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
  let mappedData = mapData(data);
  await send(mappedData);
}


// --------------- REQUIRED MODULES ---------------- //

// you can include nodejs-native modules here too!
const https = require('https');

// --------------- PROCESSING CODE ------------------- //

/**
 * This maps the crownstone hub data format to the required data format.
 * Crownstone Hub Data format is an array of
 *  {
 *    crownstoneId:         number, // 1..255
 *    crownstoneMacAddress: string, // "a1b2c3d4e5f6"  hexstring format
 *    assetMacAddress:      string, // "a1b2c3d4e5f6"  hexstring format
 *    assetRssi:            number, //
 *    rssiChannel:          number, // 37, 38, 39
 *    timestamp:            number, // js timestamp (millis since epoch)
 *  }
 */
function mapData(items) {
  let measurementsPerCrownstone = {};

  for (let item of items) {
    let mac = processMacAddress(item.crownstoneMacAddress);
    if (measurementsPerCrownstone[mac] === undefined) {
      measurementsPerCrownstone[mac] = {
        id: mac,
        tags: []
      }
    }
    measurementsPerCrownstone[mac].tags.push({
      id: processMacAddress(item.assetMacAddress),
      ts: item.timestamp,
      rssi: item.assetRssi
    })
  }

  let dataArray = Object.values(measurementsPerCrownstone);

  return {
    id: getUUID(),
    ts: data.timestamp,
    locs: dataArray
  }
};

// --------------------- MAKE REQUEST ---------------- //

async function send(data) {
  return new Promise((resolve, reject) => {
    let stringifiedData = JSON.stringify(data);
    let options = {
      host: 'myNewEndpoint.eu-west-1.amazonaws.com',
      path: '/topics/crownstone/asset/tracker/',
      port:  7500,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': stringifiedData.length
      },
      ca: caCertificate,
      key: privatePemKey,
      cert: certificatePem,
    };

    const req = https.request(options, res => {
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



// ------------  UTIL CODE ---------------------//

function processMacAddress(input) {
  input = input.replace(/:/g,"")
  return input.toUpperCase();
}

function getUUID() {
  return (
    S4() + S4() + '-' +
    S4() + '-' +
    S4() + '-' +
    S4() + '-' +
    S4() + S4() + S4()
  );
}

const S4 = function () {
  return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
};


// -------------- CONSTANTS -------------------- //


// These certificates would have been obtained from disk usually.
// In this customHandler we just use the content
// NOTE: These keys are all fake!
const caCertificate = `-----BEGIN CERTIFICATE-----
XUzREJUmz9I6SLg68lVK3NWW9MGMjA3kv8RZGc+QGwKCAQBXw7nbqJty++bFRG6b
yikiTyVR4TGNsKnPfhzhkK8LaKAlOkXTx2OyDWIaxuBkXiI+cNEFTt1ufsL8dEVn
ReefX4r2VAmJZ1QbRyp+xN+NREP/Tqejm1CZhSJdX1R/seWh7soz2EMt+N3PKGQ0
lPTpdL7aBolgxsP10KLLYITO90FsqowrC9zK+mzBOyv9psJQU5/cARJ7QyGoZkjV
HINaUkgzYtg8gXpG96K34A/hOW2t+nonHKUe3Q0xiOdmKc4wdLAjIyoQpTfnH8d4
h2EBIebEgApgm+uztC4kLyOrEMDUaGluCkCS4DmpL5wsulVDtMLySz6eSKiuT9HX
tPu9AoIBAQC5QLnJ5AHLl2NZrjAylP89LUhf6e94TFaBHjmz3D2F5/lmnF2ysZW1
QCYtQp+ox5n3Dc99tyoPxarHz091oJeUX5gTEfrd1wpFMcp+lD6w3hdsaTyJ658h
cJ80VgNDbexD1taRB8dIYN02atL8T3Jr/IC4Z4wBw17NNXBINCVVM/PAM2iNK9MB
GYX8y5PBTjDwAm86T2msofiAzSd8qlx3fvSFQOahelNkgZacg8HveFS3w+KYNoIQ
wD4YWyBaBRW+DZWgBE/o1+0ZeFIk8neCN2txE21NcwePL21HAeKqiMfy0xkmd87c
rmJofM7WN2ZtiWIs/oXzvJkKIM9B7VdXAoIBAQDvI4/9WDT0imSJkZuaP5H03emc
WZl8g6wWkampjCbmd+QZZmCXcv8Cm0OeHnkL6D3J3vEMI2+y/yXWQV+oWZilNify
4puWfCdefGIr6Y4SDBMow64XF5aUT1ltsE55TUNXL8jmek1zGo+eXR81oS1FISR+
JwCsCPCY/A026T2TVjhDX7GP0Ebiyv4+0u9d3J3CBDrlQY2Nwg0hO8mhhVcdHryy
Qs3AJSh4SwxtXUa5WOoqSolQZKl6Tcq16sKwPQrOtkfx52CFygB42glpXNXLvSOD
P8b2sY5lkdw+wwA8AgmVEtwprWcp+qQRpmISWPSHPZIqaB/xf1ZeVHNm26cZunc6
qYwK9U/YdgpDy/+PSKDlgggavvG5
-----END CERTIFICATE-----
`;

// NOTE: These keys are all fake!
const privatePemKey = `-----BEGIN RSA PRIVATE KEY-----
2mgLav5QIwoB8oDW2Jlv+0CSr05ylucsOBIO5anZEDxjK2m/AYzzw/4sciFS+4j2
0OtyL9W65j7m2HOZ6kCWL97uuyRYNypDqOBtUY7JWd+VXVE/Nx7/v4pOnoP+6ik7
xP71eAg8cZF/Iq4m0ahP/BPeNW0Md/ilFTCq8wCJvnL99IymIcuEyUS4KZsg2mWB
MRU7Q74cOV6YtoH+Rg7LJI02Sjm04HiXKqUx9GrJAmgpo2v6nEZS5UFNSCed8yBp
b+AK56miGYprl6peNXFq4Cz8GWvl7n3EOyJ+puMbT6vp+j/rLUGBQdXA1bFHebxl
2wiAkGtcCuK2dPNx14u2g4euaWEFz8eDYZCllo6vyoS2a/gLfw2fpFneEGJtueZP
eAM9GLFrwbJHEd8t2TeuJJcX/U3puHoabHL/TW3v44RWYZ1JmaBysstG4xWIZW2u
QXa1rYS1j0bG1fjyP9RjKAoicSsTEJ+ylAp1G5ht9JP9BNKjykGJsGlp75Jh5HYf
f0Jkw536QGI1AxgrZ9geRjNmVUbqBD7f5ec5xMvCqSFV/FlyV8zgjexjST0neH3w
S8gr0w0dAoveh73yAFTrg47f11d2JQ3nMqc4E9t8S1VJ1U1MWQKCAQEA9tPjYu5y
LlShlzWkUNG/057tGtf+q2EkIjsKk2EnQMHTtDmkgvaJGHR+g2C99ONjkd5xl/bN
Vn4cOYNVJS3Uy9d3Zvrj4aUe7nKk9fDuXpW/xdlL+BQsCja6wzwUVbcA6PIVJLr3
UBjpxrNjv/zwvtFpuVVMKAiTssFKDgg9xykfsWLNvGTvWAq4GEFxvn1NeOAFy98+
9nicea1Vx+C3wZM/SPeznsX4mbuqWZunYaT12opbAEiNW9TZSCTsGDnJ6MONWekN
llThsbZbu+t+24xiolVvPMmGeNHNqt/z+9++q3TlrBZwhy1My2zk8icQqm6+PXpm
3XEnBVsEr4nrZQKCAQEA1v5p3UrI0Hby8cSTsstTp14F7Qi5S5CQ6LTo2564veEp
TjiWB6PQCEuYP4rYdl7EeeiTCjwQsiOrpqrNaHhbA9FdCjkL+Ly7GXRrFAbleL0q
uDWIlHmyWXDeVeS3fxQMpZaclrKRcCQS+3G3EsrgqKJG9+jF8q2nuJxVRQ7FnNgr
kySAQj4GgUPRjaHF9/whMZiS5oMcrrGTE83vf3rxloaOt+LcAwhXNySaNtrHc+B8
llThsbZbu+t+24xiolVvPMmGeNHNqt/z+9++q3TlrBZwhy1My2zk8icQqm6+PXpm
3XEnBVsEr4nrZQKCAQEA1v5p3UrI0Hby8cSTsstTp14F7Qi5S5CQ6LTo2564veEp
TjiWB6PQCEuYP4rYdl7EeeiTCjwQsiOrpqrNaHhbA9FdCjkL+Ly7GXRrFAbleL0q
uDWIlHmyWXDeVeS3fxQMpZaclrKRcCQS+3G3EsrgqKJG9+jF8q2nuJxVRQ7FnNgr
kySAQj4GgUPRjaHF9/whMZiS5oMcrrGTE83vf3rxloaOt+LcAwhXNySaNtrHc+B8
vJxpce1iTdLYGK9IkNQsUd7ZoHOmLfGpr5HIvWMHEd8t2TeuJJcX/Q==
-----END RSA PRIVATE KEY-----
`;

// NOTE: These keys are all fake!
const certificatePem = `-----BEGIN CERTIFICATE-----
xP71eAg8cZF/Iq4m0ahP/BPeNW0Md/ilFTCq8wCJvnL99IymIcuEyUS4KZsg2mWB
MRU7Q74cOV6YtoH+Rg7LJI02Sjm04HiXKqUx9GrJAmgpo2v6nEZS5UFNSCed8yBp
b+AK56miGYprl6peNXFq4Cz8GWvl7n3EOyJ+puMbT6vp+j/rLUGBQdXA1bFHebxl
2wiAkGtcCuK2dPNx14u2g4euaWEFz8eDYZCllo6vyoS2a/gLfw2fpFneEGJtueZP
eAM9GLFrwbJHEd8t2TeuJJcX/U3puHoabHL/TW3v44RWYZ1JmaBysstG4xWIZW2u
QXa1rYS1j0bG1fjyP9RjKAoicSsTEJ+ylAp1G5ht9JP9BNKjykGJsGlp75Jh5HYf
f0Jkw536QGI1AxgrZ9geRjNmVUbqBD7f5ec5xMvCqSFV/FlyV8zgjexjST0neH3w
S8gr0w0dAoveh73yAFTrg47f11d2JQ3nMqc4E9t8S1VJ1U1MWQKCAQEA9tPjYu5y
LlShlzWkUNG/057tGtf+q2EkIjsKk2EnQMHTtDmkgvaJGHR+g2C99ONjkd5xl/bN
Vn4cOYNVJS3Uy9d3Zvrj4aUe7nKk9fDuXpW/xdlL+BQsCja6wzwUVbcA6PIVJLr3
UBjpxrNjv/zwvtFpuVVMKAiTssFKDgg9xykfsWLNvGTvWAq4GEFxvn1NeOAFy98+
5Owo+UHy+3Erdm8th8BMDuV5eFlsgqsEtn3CSVc4M86F189YuW0zOdhvAva2WUaF
3XER37pvfHlnkGo18/kbkYYEA7BSXCXVgoZQPGE2SX7QtHxmndIMenbf1joPGAsQ
Bi1bSQ6qox1arboVsJtGtzRPSN90uEB8hRbizz2+pZ/S08mMT1dCr3bFn8N+/87d
rBIXYS7BkT0XKmGiZW8rlfNupaVoenXQNPtsAGUy3czXEUzOYjjO20ufo6cCAwEA
AQKCAgB8IvabZrq17fBLRUMEBBY0EWsjRDNHyQKJkJ2ZRaCFX6kTBFIimWb3BWqw
2mgLav5QIwoB8oDW2Jlv+0CSr05ylucsOBIO5anZEDxjK2m/AYzzw/4sciFS+4j2
0OtyL9W65j7m2HOZ6kCWL97uuyRYNypDqOBtUY7JWd+VXVE/Nx7/v4pOnoP+6ik7
-----END CERTIFICATE-----
`
