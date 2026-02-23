const dns = require("dns");
const fs = require("fs");

dns.resolveSrv(
  "_mongodb._tcp.interviewos.um6lhdw.mongodb.net",
  (err, addresses) => {
    if (err) {
      fs.writeFileSync("dns-out.txt", `Local DNS Error: ${err.message}`);
    } else {
      fs.writeFileSync(
        "dns-out.txt",
        `Local DNS Success:\n${JSON.stringify(addresses, null, 2)}`,
      );
    }
  },
);
