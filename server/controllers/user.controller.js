const User = require("../models/user");
const userController = {};

//sid = socket.id
userController.saveUser = async (userName, sid) => {
  //이미 있는 유저인지 확인, 없다면 새로 유저정보 생성
  let user = await User.findOne({ name: userName });
  if (!user) {
    user = new User({
      name: userName,
      token: sid,
      online: true,
    });
  }
  // 있는 유저라면 연결 정보 token 값만 교체
  user.token = sid;
  user.online = true;

  await user.save();
  return user;
};

//checkUser 함수 생성
// 이 함수를 이용해서 socketid로 유저를 찾고 없으면 에러, 있으면 user return
userController.checkUser = async (sid) => {
  const user = await User.findOne({ token: sid });
  console.log("socket ID : ", sid);
  if (!user) throw new Error("user not found");
  return user;
};

module.exports = userController;
