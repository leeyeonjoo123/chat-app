// 채팅방 정보 저장할 room 모델 만들기
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    room: String,
    members: [
      {
        type: mongoose.Schema.ObjectId,
        unique: true,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
