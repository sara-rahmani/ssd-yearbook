"use strict";

//MongoDB connection setup
const { mongoose } = require("mongoose");
const uri =
  "mongodb+srv://sara-rahmani:SSD0@ssd-0.vc5uvbq.mongodb.net/express-yourself-crud?retryWrites=true&w=majority";

// set up default mongoose connection
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// store a reference to the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const logger = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const indexRouter = require("./routers/indexRouter");
const profilesRouter = require("./routers/profilesRouter");
const apiRouter = require("./routers/apiRouter");

const port = process.env.PORT || 3003;
const app = express();

// allow cross origin requests from any port on local machine
app.use(cors({ origin: [/127.0.0.1*/, /localhost*/] }));

// log all http requests
app.use(logger("dev"));

// use file upload middleware
app.use(fileUpload());

// use express.static middleware to make the public folder accessible
app.use(express.static("public"));

// Enable layouts
app.use(expressLayouts);
// Set the default layout
app.set("layout", "./layouts/full-width");

// Make views folder globally accessible
app.set("views", path.join(__dirname, "views"));
// Tell express that we'll be using the EJS templating engine
app.set("view engine", "ejs");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// index routes
app.use(indexRouter);

// profiles routes
app.use("/profiles", profilesRouter);

// api routes
app.use("/api", apiRouter);

// handle unrecognized routes
app.get("*", function (req, res) {
  res.status(404).send('<h2 class="error">File Not Found</h2>');
});

// start listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
