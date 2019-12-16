const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("javascript");
});

app.listen(9000, () => console.log("listening on 9000"));
