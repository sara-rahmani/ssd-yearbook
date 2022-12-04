const { mongoose } = require("mongoose");
const Profile = require("./models/Profile.js");

// Replace the uri string with your connection string.
// Also make sure to include the database name just before the ?
const uri =
  "mongodb+srv://demo-user:lKgoG5hRan2y0MHT@ssd-0.lgsgjzq.mongodb.net/test-db?retryWrites=true&w=majority";

// set up default mongoose connection
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// store a reference to the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Once we have our connection, let's load and log our profiles
db.once("open", async function () {
  const profiles = await getAllProfiles();
  console.log(profiles);
  // if we don't close the db connection, our app will keep running
  db.close();
});

// We'll better organize this momentarilly...
async function getAllProfiles() {
  let profiles = await Profile.find({});
  return profiles;
}
