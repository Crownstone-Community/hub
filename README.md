# crownstone-hub

The Hub consists of the loopback 4 framework and the crownstone usb.


# Installation

First install the dependencies. Run:

```
yarn
```

Then, you can start the hub program by:

```
node execute.js
```

or

```
npm start
```

or take a look a the provided shell scripts to run the hub with debugging logs.

# Development

If you're working on the hub code, ignore the dist folder completely. This is generated on the fly from the src folder.

Assuming you've already run yarn, you can run:

```
npm run dev
```

to start the typescript compiler in watch mode.



# Getting started.

You will need to do a few things in this version of the hub code to get started.

- You need to connect the Crownstone USB and add it to your sphere.
- You need to go to https://my.crownstone.rocks/ get a token and go the explorer
- [Post /Spheres/{id}/hub](https://cloud.crownstone.rocks/explorer/#!/Sphere/Sphere_createHub) create a hub. The id is the sphereId, the token is 64 random bytes in hexstring format (so 128 characters) and the name is up to you.
- Get the hub cloud id from [Get /Spheres/{id}/hubs](https://my.crownstone.rocks/explorer/#!/Sphere/Sphere_prototype_get_hubs), and write it down, as you'll need it later.
- Get the `sphereAuthorizationToken` of the correct sphere from [keysV2](https://my.crownstone.rocks/explorer/#!/user/user_getEncryptionKeysV2).
- When running on your local computer, go to [https://localhost:5050](https://localhost:443).
- Your browser will be pissed that the certificates are not valid so click yes i know or something to continue.
- Click `Authorize` on the top right, and fill in the `sphereAuthorizationToken`.
- Tell the hub about it's account: [Post /hub](https://localhost:443/explorer/#/HubController/HubController.createHub) with the following format:
  ```
  {
    "name": "name from cloud",
    "token": "hexstring token from cloud",
    "cloudId": "id of hub in cloud",
    "sphereId": "id of sphere in cloud"
  }
  ```
- Awesome! You're done!

