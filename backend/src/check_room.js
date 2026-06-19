const mongoose = require("mongoose");
const { InterviewRoom } = require("./models/room.model");
const { User } = require("./models/user.model");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
  const rooms = await InterviewRoom.find({}).populate("interviewer candidate").lean();
  console.log("Rooms:", JSON.stringify(rooms, null, 2));
  await mongoose.disconnect();
}
run().catch(console.error);
