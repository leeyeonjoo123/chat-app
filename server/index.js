const { createServer } = require("http");
const app = require("./app");
const { Server } = require("socket.io");
require("dotenv").config();

const httpServer = createServer(app);
//웹소켓들고오기
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

httpServer.listen(process.env.PORT, () => {
  console.log("sever listening on port", process.env.PORT);
});

//utils의 io 매개변수를 가져온다.
require("./utils/io")(io);
