const fs = require("fs").promises;
const path = require("path");

const express = require("express");
const apiRouter = express.Router();

const dataPath = path.join(__dirname, "../data/");

apiRouter.get("/profiles", (req, res) => {
  fs.readFile(dataPath + "profiles.json")
    .then((contents) => {
      console.log(contents);
      // need to parse the raw buffer as json if we want to work with it
      const profilesJson = JSON.parse(contents);
      console.log(profilesJson);
      //   prepare and send an OK response
      res.json(profilesJson);
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500);
      res.end("Error");
    });
});

apiRouter.get("/profiles/:id", (req, res) => {
  fs.readFile(dataPath + "profiles.json")
    .then((contents) => {
      console.log(contents);
      // need to parse the raw buffer as json if we want to work with it
      const profilesJson = JSON.parse(contents);
      const profileJson = profilesJson
        .filter((profile) => profile.id === req.params.id)
        .shift();
      console.log(profileJson);
      //   prepare and send an OK response
      res.json(profileJson);
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500);
      res.end("Error");
    });
});

apiRouter.get("/quotes", (req, res) => {
  fs.readFile(dataPath + "quotes.json")
    .then((contents) => {
      console.log(contents);
      // need to parse the raw buffer as json if we want to work with it
      const quotesJSON = JSON.parse(contents);
      console.log(quotesJSON);
      //   prepare and send an OK response
      res.json(quotesJSON);
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500);
      res.end("Error");
    });
});

module.exports = apiRouter;
