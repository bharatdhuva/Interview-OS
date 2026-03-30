const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://bharatdhuva:interviewOS@interviewos.um6lhdw.mongodb.net/?appName=InterviewOS";
MongoClient.connect(uri)
  .then(() => {
    console.log("Connected successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Error connecting to MongoDB:", e.message);
    process.exit(1);
  });
