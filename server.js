const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const colors = require("colors");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
// const db = require("./config/keys").mongoURI;

const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 3002;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() =>
    console.log(
      `MongoDB connected on http://${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`
        .cyan.underline.bold
    )
  )
  .catch((err) => console.log(err));

const languages = require("./routes/api/v1/languages.js");
const translations = require("./routes/api/v1/translations");
const words = require("./routes/api/v1/words");
const users = require("./routes/api/v1/users");
const auth = require("./routes/api/v1/auth");

app.use("/api/v1/languages", languages);
app.use("/api/v1/translations", translations);
app.use("/api/v1/words", words);
app.use("/api/v1/users", users);
app.use("/api/v1/auth", auth);

app.listen(
  PORT,
  console.log(
    `Server running in mode: ${process.env.NODE_ENV}, on port: ${PORT}`.blue
      .bold
  )
);
