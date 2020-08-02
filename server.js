const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const colors = require("colors");

const app = express();

app.use(express.json());
const db = require("./config/keys").mongoURI;

const languages = require("./routes/api/v1/languages.js");
// const translations = require("./routes/api/v1/translations");
const words = require("./routes/api/v1/words");
// const users = require("./routes/api/v1/users");

app.use("/api/v1/languages", languages);
// app.use("/api/v1/translations", translations);
app.use("/api/v1/words", words);
// app.use("/api/v1/users", users);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(console.log(db))
  //   .then(() =>
  //     console.log(
  //       `MongoDB connected on: http://${db.connection.host}:${db.connection.port}/${db.connection.name}`
  //         .cyan.underline.bold,
  //       "\n"
  //     )
  //   )
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3002;

app.listen(
  PORT,
  console.log(
    `Server running in mode: ${process.env.NODE_ENV}, on port: ${PORT}`.blue
      .bold
  )
);
