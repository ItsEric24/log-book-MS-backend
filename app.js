const express = require("express");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const dailyLogRouter = require("./routes/dailyLogRoutes/dailyLogRoutes");
const logBookRouter = require("./routes/logBookRoutes/logbookRoutes");
const userRouter = require("./routes/userRoutes/userRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//* Routes
app.use("/api/daily-logs", dailyLogRouter);
app.use("/api/logbooks", logBookRouter);
app.use("/api/users", userRouter);

//*listen for incoming requests
app.listen(8000, () => {
  console.log("Listening on port 8000");
});