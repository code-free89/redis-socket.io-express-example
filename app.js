const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require('axios');

var redis = require("redis");
var client = redis.createClient();

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

let interval;
const APIEndPoint = "https://daily1stocknews.com/test/test_data.php";

client.on("connect", function() {
  console.log("Redis connected");
});

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  axios.get(APIEndPoint).then(function (response) {
    client.set("response", response.data, function(err, reply) {
      console.log(reply);
    });
    socket.emit("FromAPI", response.data);
  }).catch(function (error) {
    // handle error
    console.log("=============== error ===============", error);
  })
};

server.listen(port, () => console.log(`Listening on port ${port}`));