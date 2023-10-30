const router = require("express").Router();
const User = require("./user.routes");
const Media = require("./media.routes");

// API
router.use("/api/v1", Media);
router.use("/api/v1", User);

module.exports = router;
