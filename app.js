require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const router = require("./routes");
const { PORT = 3000 } = process.env;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static("public/images"));
app.use("/videos", express.static("public/videos"));
app.use("/documents", express.static("public/documents"));

app.use("/", router);

app.listen(PORT, () => console.log("listening on port", PORT));
