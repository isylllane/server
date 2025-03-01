require("dotenv").config();
const express = require("express");
const sequelize = require("./db");
const PORT = process.env.PORT || 7000;
const models = require("./models/models");
const router = require("./routes/index");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");

const errorHandler = require("./middleware/ErrorHandingMiddleware");

const app = express();
app.use(cors());
app.use("/api/img", express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(fileUpload({}));

app.use("/api", router);

// Обработка ошибок
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};
start();
