const dns = require("dns");
const fs = require("fs");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dns.resolveSrv(
  "_mongodb._tcp.interviewos.um6lhdw.mongodb.net",
  (err, addresses) => {
    if (err) {
      fs.writeFileSync(
        "dns-out-google.txt",
        `Google DNS Error: ${err.message}`,
      );
    } else {
      fs.writeFileSync(
        "dns-out-google.txt",
        `Google DNS Success:\n${JSON.stringify(addresses, null, 2)}`,
      );
    }
  },
);
