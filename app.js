const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const session = require("express-session");
const bcryptjs = require("bcryptjs");
const createError = require("http-errors");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");

const indexRouter = require("./routes/index");
const User = require("./models/user");
require("dotenv").config();

//mongodb atlas connection
async function connectToMongoDB() {
  mongoose.set("strictQuery", false);
  await mongoose.connect(process.env.ATLAS_CONN);
}
connectToMongoDB().catch((err) => console.log(err));

//passport functions
passport.use(
  new LocalStrategy(async function (username, password, done) {
    const user = await User.findOne({ username: username });

    if (user) {
      bcryptjs.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      });
    } else {
      return done(null, false, { message: "Incorrect username" });
    }
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function (id, done) {
  const user = await User.findById(id);

  if (user) {
    done(null, user);
  }
});

//start express
const app = express();

//view engine set up
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//useful middleware set up
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//passport set up
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//others
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

//route(s)
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
