const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); //.env 파일 열기위한 설정
const cors = require("cors");
const app = express();
const Room = require("./models/room");

app.use(cors());

mongoose
  .connect(process.env.DB, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB 연결 완료");
  });

app.get("/", async (req, res) => {
  Room.insertMany([
    {
      room: "자바스크립트 단톡",
      members: [],
    },
    {
      room: "React 단톡",
      members: [],
    },
    {
      room: "Node.js 단톡",
      members: [],
    },
  ])
    .then(() => res.send("ok"))
    .catch((error) => res.send(error));
});

module.exports = app;
