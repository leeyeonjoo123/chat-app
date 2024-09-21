const chatController = require("../controllers/chat.controller");
const userController = require("../controllers/user.controller");
const roomController = require("../controllers/roomController");

module.exports = function (io) {
  // io 관련 모든 함수들 작성
  // 소켓에서 제공하는 함수
  // 1. 말하는 함수 .emit()
  // 2. 듣는 함수 .on()

  // 연결된 사람을 socket이라 하고 매개변수로 받아온다
  io.on("connection", async (socket) => {
    socket.emit("rooms", await roomController.getAllRooms());
    console.log("client is connected", socket.id);

    // 기존 login 코드 지워주기(채팅방에 들어가야 조인 메세지를 보여주기 때문에 필요없어져서 삭제)
    socket.on("login", async (userName, cb) => {
      try {
        const user = await userController.saveUser(userName, socket.id);
        // const welcomeMessage = {
        //   chat: `${user.name} 님이 채팅방에 참여하였습니다.`,
        //   user: { id: null, name: "system" },
        // };
        // io.emit("message", welcomeMessage);
        console.log("backend", userName);
        cb({ ok: true, data: user });
      } catch (error) {
        console.log("login error:", error);
        cb({ ok: false, error: error.message });
      }
    });

    socket.on("sendMessage", async (message, cb) => {
      try {
        // socket.id 로 유저 찾기
        const user = await userController.checkUser(socket.id);
        console.log("User info : ", user);
        // message 저장
        const newMessage = await chatController.saveChat(message, user);
        // newMessage를 모두에게 알려야 함
        io.to(user.room.toString()).emit("message", newMessage);
        cb({ ok: true });
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    // socket.on("sendMessage", async (message, cb) => {
    //   try {
    //     const user = await userController.checkUser(socket.id);
    //     if (user) {
    //       const message = await chatController.saveChat(message, user);
    //       io.to(user.room.toString()).emit("message", message); // 이부분을 그냥 emit에서 .to().emit() 으로 수정
    //       return cb({ ok: true });
    //     }
    //   } catch (error) {
    //     cb({ ok: false, error: error.message });
    //   }
    // });

    socket.on("disconnect", () => {
      console.log(socket.id, "user is disconnected");
    });

    socket.on("joinRoom", async (rid, cb) => {
      console.log("join socket - Room ID : ", rid);
      try {
        const user = await userController.checkUser(socket.id); // 유저 정보 들고오기
        await roomController.joinRoom(rid, user); // room 데이터의 members 필드에 user 추가
        socket.join(user.room.toString()); // socket은 해당 room id로 된 채널에 조인
        const welcomeMessage = {
          chat: `${user.name} 님이 방에 참여 is joined to this room`,
          user: { id: null, name: "system" },
        };
        // 이 room id에 들어있는 사람들에게 말한다(emit) welcomeMessage를
        io.to(user.room.toString()).emit("message", welcomeMessage); // 유저가 조인했다는 메시지를 방에 있는 유저에게만 보여줌
        io.emit("rooms", await roomController.getAllRooms()); // 다시 업데이트된 room 데이터를 클라이언트들에게 보내줌(실시간 조인 멤버 확인 가능)
        cb({ ok: true });
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    socket.on("leaveRoom", async (_, cb) => {
      try {
        const user = await userController.checkUser(socket.id); // 유저 정보 들고오기
        await roomController.leaveRoom(user); // room 데이터의 members 필드에 user 추가
        // socket.join(user.room.toString()); // socket은 해당 room id로 된 채널에 조인
        const leaveMessage = {
          chat: `${user.name} left this room`,
          user: { id: null, name: "system" },
        };
        // 이 room id에 들어있는 사람들에게 말한다(emit) welcomeMessage를
        // io.to(user.room.toString()).emit("message", leaveMessage); // 유저가 조인했다는 메시지를 방에 있는 유저에게만 보여줌
        socket.broadcast.to(user.room.toString()).emit("message", leaveMessage);
        io.emit("rooms", await roomController.getAllRooms()); // 다시 업데이트된 room 데이터를 클라이언트들에게 보내줌(실시간 조인 멤버 확인 가능)
        socket.leave(user.room.toString()); //추가
        cb({ ok: true });
      } catch (error) {
        cb({ ok: false, error: error.message });
      }
    });

    // socket.on("leaveRoom", async (_, cb) => {
    //   try {
    //     console.log("socket on: leaveRoom");
    //     const user = await checkUser(socket.id);
    //     await roomController.leaveRoom(user);
    //     const leaveMessage = {
    //       chat: `${user.name} left this room`,
    //       user: { id: null, name: "system" },
    //     };
    //     socket.broadcast.to(user.room.toString()).emit("message", leaveMessage); // socket.broadcast의 경우 io.to()와 달리,나를 제외한 채팅방에 모든 맴버에게 메세지를 보낸다
    //     io.emit("rooms", await roomController.getAllRooms());
    //     socket.leave(user.room.toString()); // join했던 방을 떠남
    //     cb({ ok: true });
    //   } catch (error) {
    //     cb({ ok: false, message: error.message });
    //   }
    // });
  });
};
