const express = require("express");
const dailyLogRouter = express.Router();
const db = require("../../db/db");
const {
  authenticateUser,
} = require("../../utils/auth");
const { isValidUUID } = require("../../utils/helperFunctions");

//* add a new daily_log to the database
dailyLogRouter.post("/add", authenticateUser, async (req, res) => {
  const { studentId, day, date, weekNumber, description, skillsLearnt } =
    req.body;

  if (
    !studentId ||
    !day ||
    !date ||
    !weekNumber ||
    !description ||
    !skillsLearnt
  ) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  //* If weekNumber, day, date and studentId already exists, return an error
  const log = await db.query(
    "SELECT * FROM daily_logs WHERE week_number = $1 AND day = $2 AND date = $3 AND student_id = $4",
    [weekNumber, day, date, studentId]
  );
  if (log.rows.length > 0) {
    return res.status(400).json({ message: "Log already exists" });
  }

  try {
    db.query(
      "INSERT INTO daily_logs (student_id, day, date, week_number, description_of_work, skills_learnt) VALUES ($1, $2, $3, $4, $5, $6)",
      [studentId, day, date, weekNumber, description, skillsLearnt]
    );
    res.status(200).json({ message: "Logbook created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//* Get all daily logs for a particular student
dailyLogRouter.get("/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;

  if (!isValidUUID(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const dailyLogs = await db.query(
      "SELECT * FROM daily_logs WHERE student_id = $1",
      [id]
    );
    res.status(200).json({
      data: dailyLogs.rows,
    });
  } catch (error) {
    console.log(error);
  }
});

//* Get a particular daily log from the database by id
dailyLogRouter.get("/daily-log/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;

  if (!isValidUUID(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const dailyLog = await db.query("SELECT * FROM daily_logs WHERE id = $1", [
      id,
    ]);
    res.status(200).json({
      data: dailyLog.rows,
    });
  } catch (error) {
    console.log(error);
  }
});

//* Update a particular daily_log from the database by id
dailyLogRouter.put("/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;
  const { day, date, weekNumber, description, skillsLearnt } = req.body;

  if (!day || !date || !weekNumber || !description || !skillsLearnt) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    db.query(
      "UPDATE daily_logs SET  day = $1, date = $2, week_number = $3, description_of_work = $4, skills_learnt = $5 WHERE id = $6",
      [day, date, weekNumber, description, skillsLearnt, id]
    );
    res.status(200).json({ message: "Daily log updated successfully" });
  } catch (error) {
    console.log(error);
  }
});

//* Delete a particular daily_log from the database by id
dailyLogRouter.delete("/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;
  try {
    db.query("DELETE FROM daily_logs WHERE id = $1", [id]);
    res.status(200).json({ message: "Daily log deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = dailyLogRouter;
