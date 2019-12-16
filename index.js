const express = require("express");
const app = express();
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");
var cmd = require("node-command-line");
cmd.run(__dirname + "/jdk-11/bin/java -jar procon.jar");
console.log("executed procon.jar");

app.use(bodyParser());
app.use(express.static(path.join(__dirname)));

app.get("/test/:url", (req, res) => {
  let { url, token } = req.params;
  console.log(url);
  axios
    .get(`http://${url}/status`)
    .then(result => res.send(result.data))
    .catch(err => {
      if (err) console.log(err);
    });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.post("/move/:token/:url", (req, res) => {
  console.log("body", req.body);
  let { url, token } = req.params;
  console.log("token", token, "url", url);
  // for (let i = 0; i < 4; i++) {
  axios
    .post(`http://${url}/procon/${token}/move`, req.body)
    .then(res => console.log("res", res))
    .catch(err => {
      if (err) console.log(err);
    });
  // }

  res.send();
});

app.post("/");

app.listen(3100, () => console.log("listening on port 3100"));
