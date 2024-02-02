const User = require("../models/user");
const Message = require("../models/message");
const bcryptjs = require("bcryptjs");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const messageList = await Message.find()
    .populate("user", "username name surname")
    .exec();

  res.render("layout", {
    view: "msg_list",
    title: "Muro de mensajes",
    data: messageList,
    error: null,
  });
});

exports.delete_msg = asyncHandler(async (req, res, next) => {
  await Message.findByIdAndRemove(req.body.msgId);
  res.redirect("/");
});

exports.user_signup_get = (req, res) => {
  res.render("layout", {
    view: "user_signup_form",
    title: "Registrarse",
    data: null,
    error: null,
  });
};

exports.user_signup_post = [
  body(
    "username",
    "El nombre de usuario debe contener minimo un caracter y maximo 30"
  )
    .trim()
    .isLength({ min: 1, max: 30 })
    .bail()
    .custom(async (val) => {
      const myUsr = await User.findOne({ username: val });
      if (myUsr !== null) {
        throw new Error("El nombre de usuario ya se encuentra en uso");
      }
      return true;
    }),
  body("name", "El nombre debe contener minimo un caracter y maximo 30")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape(),
  body("surname", "El apellido debe contener minimo un caracter y maximo 30")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape(),
  body("password", "Debe introducir una contraseña").exists(),
  body("password2", "Las contraseñas no coinciden")
    .exists()
    .custom((value, { req }) => value === req.body.password),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let newUser = {
      username: req.body.username,
      name: req.body.name,
      surname: req.body.surname,
      isAdmin: typeof req.body.isAdmin === "undefined" ? false : true,
    };

    if (!errors.isEmpty()) {
      res.render("layout", {
        view: "user_signup_form",
        title: "Registrarse",
        data: newUser,
        error: errors.array(),
      });
    } else {
      const hashedPass = await bcryptjs.hash(req.body.password, 10);

      if (hashedPass) {
        newUser.password = hashedPass;
        const usr = new User(newUser);
        await usr.save();
        res.redirect("/");
      }
    }
  }),
];

exports.user_login_get = (req, res) => {
  return res.render("layout", {
    view: "user_login_form",
    title: "Ingresar",
    data: null,
    error: null,
  });
};

exports.user_login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/sign-up",
});

exports.user_log_out = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    return res.redirect("/");
  });
};

exports.user_create_get = (req, res) => {
  return res.render("layout", {
    view: "create_message_form",
    title: "Crear mensaje",
    data: null,
    error: null,
  });
};

exports.user_create_post = [
  body("title", "Debe incluir un titulo de maximo 50 caracteres")
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape(),
  body("text", "Incluya un mensaje").trim().exists().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      date: Date.now(),
      user: req.user.id, // o .id?
    });

    if (!errors.isEmpty()) {
      return res.render("layout", {
        view: "create_message_form",
        title: "Crear mensaje",
        data: { title: message.title, text: message.text },
        error: errors.array(),
      });
    } else {
      await message.save();
      return res.redirect("/");
    }
  }),
];
