"use strict";

//MongoDB connection setup
const { mongoose } = require("mongoose");
const uri =
  "mongodb+srv://sara-rahmani:SSD0@ssd-0.vc5uvbq.mongodb.net/ssd28-node-day-05?retryWrites=true&w=majority";

// set up default mongoose connection
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// store a reference to the default connection
const db = mongoose.connection;
db.once("open", function () {
  console.log("Connected to Mongo");
});
// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const logger = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");

//const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const indexRouter = require("./routers/indexRouter");
const profilesRouter = require("./routers/profilesRouter");
const apiRouter = require("./routers/apiRouter");

const port = process.env.PORT || 3003;
const app = express();
// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up session management with mongodb as our store
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: uri, //reusing uri from above
  collection: "sessions",
});

// Catch errors
store.on("error", function (error) {
  console.log(error);
});
app.use(
  require("express-session")({
    secret: "a long time ago in a galaxy far far away",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 20 }, // 20 minutes
    store: store,
  })
);

// Initialize passport and configure for User model
app.use(passport.initialize());
app.use(passport.session());
const User = require("./models/User");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
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


// Index routes
app.use(indexRouter);


// User routes
const userRouter = require("./routers/userRouter");
app.use("/user", userRouter);

// Secure routes
const secureRouter = require("./routers/secureRouter");
app.use("/secure", secureRouter);
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
