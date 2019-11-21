const express = require("express");
const app = express();
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

app.use(bodyParser());
app.use(express.static(path.join(__dirname)));

app.get("/test", (req, res) => {
  axios
    .get("http://localhost:8081/status")
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
  axios
    .post(`http://${url}/procon/${token}/move`, req.body)
    .then(res => console.log("res", res))
    .catch(err => {
      if (err) console.log(err);
    });
  res.send();
});

app.post("/");

app.listen(3003, () => console.log("listening on port 3003"));
