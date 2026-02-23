const dns = require("dns");
const fs = require("fs");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.resolveTxt("interviewos.um6lhdw.mongodb.net", (err, addresses) => {
  if (err) fs.writeFileSync("dns-txt-google.txt", err.message);
  else fs.writeFileSync("dns-txt-google.txt", JSON.stringify(addresses));
});
