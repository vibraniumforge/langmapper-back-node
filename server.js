const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const colors = require("colors");
const app = express();
const cors = require("cors");
require("dotenv").config();

const allowedOrigins = [
  "http://localhost:3000",
  "http://https://arcane-wave-94268.herokuapp.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },

    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],

    credentials: true,
  })
);

app.use(express.json());
// app.use(cors);
// const db = require("./config/keys").mongoURI;

const uri =
  process.env.NODE_ENV === "development"
    ? process.env.DEVELOPMENT_URI
    : process.env.PRODUCTION_URI;

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
