const express = require("express");

const app = express(); // instance of an express js application

app.use((req, res) => {
  res.send("I am from the universe");
});
app.listen(5000, () => {
  console.log("Server is running successfully on port 5000");
});
