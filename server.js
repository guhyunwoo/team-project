const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host: "localhost",
  user: "chat_db",
  password: "Sj32993329&",
  database: "sphere_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL에 연결되었습니다.");
});

// 메시지 조회 API
app.get("/messages", (req, res) => {
  const query = "SELECT * FROM chats ORDER BY timestamp ASC"; // timestamp를 기준으로 정렬
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "데이터베이스 오류" });
    }
    res.json(results); // 저장된 메시지를 JSON 형식으로 응답
  });
});

// 웹소켓 서버 설정
const wss = new WebSocket.Server({ port: 9000 });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const processeedMessage = message
      .toString("utf8")
      .split(":")[2]
      .split(",")[0]
      .replace('"', "")
      .replace('"', "");

    // 데이터베이스 쿼리
    db.query(
      "INSERT INTO chats (chatroom_id, message_text, user_id, nickname, profileimage) VALUES (?, ?, ?, ?, ?)",
      [
        1,
        processeedMessage,
        1,
        "레전드방송",
        "https://github.com/guhyunwoo/Meow/blob/master/images/%ED%82%A4%EB%A3%A8.png?raw=true",
      ],
      (err, results) => {
        if (err) {
          console.error(err);
          return; // 오류 발생 시 종료
        }

        // 메시지 전송 후 클라이언트에게 알림 (옵션)
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message.toString("utf8"));
          }
        });
      }
    );
  });

  ws.on("close", () => {
    console.log("클라이언트 연결 종료");
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
  console.log("웹소켓 서버가 9000 포트에서 실행 중입니다.");
});
