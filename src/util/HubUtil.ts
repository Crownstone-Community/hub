const os = require("os")


export function getIpAddress() {
  let ifaces = os.networkInterfaces();
  let ips = ''
  Object.keys(ifaces).forEach(function(ifname) {
    let alias = 0;
    ifaces[ifname].forEach(function(iface: any) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      // avoid self allocated ip address
      if (iface.address && iface.address.indexOf("169.254.") === -1) {
        ips += iface.address + ';'
      }

      ++alias;
    });
  });

  // remove trailing ;
  if (ips.length > 0) {
    ips = ips.substr(0, ips.length - 1)
  }

  return ips;

}