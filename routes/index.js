const express = require("express");
const router = express.Router();

const app_controller = require("../controllers/appController");

router.get("/", app_controller.index);

router.post("/", app_controller.delete_msg);

router.get("/sign-up", app_controller.user_signup_get);

router.post("/sign-up", app_controller.user_signup_post);

router.get("/log-in", app_controller.user_login_get);

router.post("/log-in", app_controller.user_login_post);

router.get("/log-out", app_controller.user_log_out);

router.get("/create", app_controller.user_create_get);

router.post("/create", app_controller.user_create_post);

module.exports = router;
