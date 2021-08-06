# Crownstone-Hub REST for internal Development

This document assumes you've read the normal REST document.

There are a number of "secret" endpoints that you can use to enable a number of developer controllers.

You just navigate to them in your browser. You have to have your SphereAuthorizationToken.


## Logging
```
https://<hub-ip>/enableLogging?access_token=<sphere-auth-token>

https://<hub-ip>/disableLogging?access_token=<sphere-auth-token>
```
[Api docs here.](./controllers/LoggingController.md)

## Developer controller
```
https://<hub-ip>/enableDeveloperMode?access_token=<sphere-auth-token>

https://<hub-ip>/disableDeveloperMode?access_token=<sphere-auth-token>
```
[Api docs here.](./controllers/DeveloperController.md)


