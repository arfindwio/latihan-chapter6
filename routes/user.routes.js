const router = require("express").Router();
const { register, login, updateProfile, authenticateUser } = require("../controllers/user.controllers");
const { image } = require("../libs/multer");
const Auth = require("../middlewares/authentication");

router.post("/register", register);
router.post("/login", login);
router.post("/updateProfile", Auth, image.single("image"), updateProfile);
router.get("/authenticate", Auth, authenticateUser);

module.exports = router;
