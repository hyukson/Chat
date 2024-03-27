const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const fs = require("fs");

const app = express();
const server = http.createServer(app);

const io = socketIo(server);

// 파일 경로 연결
app.use("/public", express.static("./public"));

/* Get 방식으로 / 경로에 접속하면 실행 되는 함수 */
app.get("/", (req, res) => {
  // 해당 파일을 읽기
  fs.readFile("./index.html", (err, data) => {
    if (err) {
      return res.send("에러");
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  });
});

// 소켓 연결이 되면 실행되는 이벤트
io.on("connection", (socket) => {
  /* on 함수로 이벤트를 정의, 신호를 수신 가능 */
  socket.on("newUser", ({ name }) => {
    /* 소켓에 이름(데이터) 저장해두기 */
    socket.name = name || socket.name || "익명";

    // to 메서드로 특정 방과 또는 소켓과 연결 가능
    io.emit("userCount", socket.adapter.rooms?.size);

    /* 특정 방 소캣(sockets)에 전송 */
    io.emit("new message", {
      message: `${socket.name}님이 접속하였습니다.`,
      types: "room",
    });
  });

  // 메시지 받기
  socket.on("message", ({ message }) => {
    const name = socket.name;

    // 나를 제외한 모든 유저
    socket.broadcast.emit("new message", {
      message,
      name,
    });

    // 나에게 보내기
    io.to(socket.id).emit("new message", {
      name,
      message,
      types: "send",
    });
  });

  // 접속을 종료하였을 때
  socket.on("disconnect", () => {
    // 접속해 있던 룸에 나감을 안내
    socket.broadcast.emit("userCount", socket.adapter.rooms?.size);

    if (!socket.name) {
      return;
    }

    socket.broadcast.emit("new message", {
      message: `${socket.name}님이 나갔습니다.`,
      types: "room",
    });
  });
});

server.listen(3000);
