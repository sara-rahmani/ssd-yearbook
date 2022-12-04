const express = require("express");
const indexRouter = express.Router();

indexRouter.get("/", (req, res) =>
  res.render("index", { title: "Mongo Profiles - Home" })
);
indexRouter.get("/about", (req, res) =>
  res.render("about", { title: "about" })
);

indexRouter.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Express Yourself - Contact Us",
    status: null,
  });
});

indexRouter.post("/contact", (req, res) => {
  res.render("contact", {
    title: "Express Yourself - Contact Us",
    status: "received",
    formData: req.body,
  });
});

module.exports = indexRouter;
