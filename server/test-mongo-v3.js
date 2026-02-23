const fs = require("fs");
const { MongoClient } = require("mongodb");
const uri =
  "mongodb://bharatdhuva:interviewOS@ac-ur9dwjf-shard-00-00.um6lhdw.mongodb.net:27017,ac-ur9dwjf-shard-00-01.um6lhdw.mongodb.net:27017,ac-ur9dwjf-shard-00-02.um6lhdw.mongodb.net:27017/?ssl=true&replicaSet=atlas-hgagjl-shard-0&authSource=admin&retryWrites=true&w=majority&appName=InterviewOS";

MongoClient.connect(uri)
  .then(() => {
    fs.writeFileSync("err-out-2.txt", "Connected successfully");
    process.exit(0);
  })
  .catch((e) => {
    fs.writeFileSync(
      "err-out-2.txt",
      `Error connecting to MongoDB:\n${e.name}: ${e.message}\nStack: ${e.stack}`,
    );
    process.exit(1);
  });
