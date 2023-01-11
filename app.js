//basic lib import
const express = require('express');
const { readdirSync } = require('fs');
const path = require('path')
const app = new express();
const bodyParser = require('body-parser');
require("dotenv").config();
const cookieParser = require('cookie-parser');

//security middleware lib import
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

//database lib import
const mongoose = require('mongoose');

//security middleware implement
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

//body parser implement
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(cookieParser());

//request rate limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use(limiter);

//mongodb connection
let Option = { autoIndex: true };
mongoose
    .set('strictQuery', true)
    .connect(process.env.URI,Option)
    .then(() => {
    console.log('Connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });


//routing implement
readdirSync("./src/routes").map(r => app.use("/api/v1", require(`./src/routes/${r}`)));

//undefined route implement
app.use("*", (req, res) => {
    res.status(404).json({ status: "failed", data: "Not Found" })
});

module.exports = app;