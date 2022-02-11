const { spawn } = require("child_process");
const express = require("express");
const app = express();
const port = 3090;

app.use((req, res, next) => {
  // console.log(req);
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ type: "application/json" }));
app.use(express.raw({ type: "application/*" }));
app.use(express.text());

app.post("/command", (req, res) => {
  console.error("#command", req.body);
  res.send({});
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

const server = require("http").Server(app);
const io = require("socket.io")(server);

io.on("connection", function (socket) {
  console.error("connected");
  socket.on("disconnect", function () {
    console.error("disconnected");
  });
  socket.on("text-to-speech", function (payload, callback) {
    console.error(`#text-to-speech`, payload);
    const playone = spawn(`/usr/bin/say`, ["-v", "Kyoko", payload.message]);
    playone.on("close", function () {
      console.log("close");
      if (callback) callback("OK");
    });
  });
  socket.on("stop-text-to-speech", function (payload, callback) {
    console.error(`#stop-text-to-speech`, payload);
    if (callback) callback("OK");
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
