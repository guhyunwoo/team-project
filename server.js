const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const WebSocket = require("ws");
const path = require("path"); // 추가
const { Console } = require("console");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, "public"))); // 'public' 폴더에 HTML 파일 저장

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

// 로그인 API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM Users WHERE Username = ? AND Password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      res.status(500).json({ error: "데이터베이스 오류" });
      return;
    }
    if (results.length > 0) {
      res.status(200).json({ message: "로그인 성공" });
    } else {
      res.status(401).json({ message: "잘못된 사용자명 또는 비밀번호" });
    }
  });
});

// 웹소켓 서버 설정
const wss = new WebSocket.Server({ port: 9000 });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log(message.toString("utf8"));

    db.query(
      "insert into Messages (Chatroom_Id, User_Id,  Message_Text) values ('',''))",
      [username, password],
      (err, results) => {
        if (err) {
          res.status(500).json({ error: "데이터베이스 오류" });
          return;
        }
        if (results.length > 0) {
          res.status(200).json({ message: "로그인 성공" });
        } else {
          res.status(401).json({ message: "잘못된 사용자명 또는 비밀번호" });
        }
      },
      wss.clients.forEach((client) => {})
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
