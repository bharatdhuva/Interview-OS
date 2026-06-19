const mongoose = require("mongoose");
const { InterviewRoom } = require("./models/room.model");
const { User } = require("./models/user.model");
const { getRoomById } = require("./controllers/room.controller");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const rooms = await InterviewRoom.find({});
  console.log("All Room IDs in DB:", rooms.map(r => r.roomId));

  const room = await InterviewRoom.findOne({ roomId: rooms[rooms.length - 1]?.roomId });
  if (!room) {
    console.log("Room not found");
    await mongoose.disconnect();
    return;
  }
  console.log("Found Room ID:", room.roomId);
  console.log("Room whiteboardKey:", room.whiteboardKey);

  const interviewer = await User.findById(room.interviewer);
  const candidate = await User.findById(room.candidate);

  console.log("Interviewer ID:", interviewer._id.toString());
  console.log("Candidate ID:", candidate._id.toString());

  // Test getRoomById for interviewer
  const reqInterviewer = {
    params: { roomId: room.roomId },
    user: { id: interviewer._id.toString(), role: interviewer.role }
  };
  const resInterviewer = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.data = data; return this; }
  };
  await getRoomById(reqInterviewer, resInterviewer);
  console.log("Interviewer Response:", resInterviewer.statusCode, resInterviewer.data);

  // Test getRoomById for candidate
  const reqCandidate = {
    params: { roomId: room.roomId },
    user: { id: candidate._id.toString(), role: candidate.role }
  };
  const resCandidate = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.data = data; return this; }
  };
  await getRoomById(reqCandidate, resCandidate);
  console.log("Candidate Response:", resCandidate.statusCode, resCandidate.data);

  await mongoose.disconnect();
}
run().catch(console.error);
