import { useState, useEffect } from "react";
import "./App.css";
import socket from "./server";
// import InputField from "./components/InputFiled/InputFiled";
// import MessageContainer from "./components/MessageContainer/MessageContainer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoomListPage from "./pages/RoomListPage/RoomListPage";
import ChatPage from "./pages/Chatpage/ChatPage";

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [rooms, setRooms] = useState([]);
  console.log("message :", messageList);

  //렌더링되자마자 ,askUserName 함수 실행
  useEffect(() => {
    console.log("rooms - ", rooms);
    socket.on("message", (message) => {
      setMessageList((prevState) => prevState.concat(message));
    });
    askUserName();
  }, []);
  const askUserName = () => {
    const userName = prompt("이름을 입력하세요");
    console.log("uuu", userName);
    //emit(대화의 제목, 보낼내용, 콜백함수-emit이 잘 처리되면 콜백함수를 받을 수 있음)
    socket.emit("login", userName, (res) => {
      console.log("머가문제login res", res);
      if (res?.ok) {
        setUser(res.data);
      }
    });
  };

  socket.on("rooms", (res) => {
    setRooms(res);
  });

  const sendMessage = (event) => {
    event.preventDefault();
    socket.emit("sendMessage", message, (message) => {
      console.log("sendMessage res", message);
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<RoomListPage rooms={rooms} />} />
        <Route exact path="/room/:id" element={<ChatPage user={user} />} />
      </Routes>
    </BrowserRouter>

    // <div>
    //   <div className="App">
    //     <MessageContainer messageList={messageList} user={user} />
    //     <InputField
    //       message={message}
    //       setMessage={setMessage}
    //       sendMessage={sendMessage}
    //     ></InputField>
    //   </div>
    // </div>
  );
}

export default App;
