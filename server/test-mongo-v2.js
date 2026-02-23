const fs = require("fs");
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://bharatdhuva:interviewOS@interviewos.um6lhdw.mongodb.net/?appName=InterviewOS";

MongoClient.connect(uri)
  .then(() => {
    fs.writeFileSync("err-out.txt", "Connected successfully");
    process.exit(0);
  })
  .catch((e) => {
    fs.writeFileSync(
      "err-out.txt",
      `Error connecting to MongoDB:\n${e.name}: ${e.message}\nStack: ${e.stack}`,
    );
    process.exit(1);
  });
