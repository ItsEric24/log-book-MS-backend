const express = require("express");
const logBookRouter = express.Router();
const db = require("../../db/db");
const { authenticateUser, isSupervisor } = require("../../utils/auth");
const { isValidUUID } = require("../../utils/helperFunctions");
const generatePDF = require("../../utils/utils");
const { sendEmail } = require("../../services/emailService");

//* Create a logbook
logBookRouter.post("/add", authenticateUser, async (req, res) => {
  const {
    studentId,
    weekNumber,
    weekSummary,
    dailyLogs,
    department,
    studentName,
    school,
  } = req.body;
  if (
    !studentId ||
    !weekNumber ||
    !weekSummary ||
    !dailyLogs ||
    !department ||
    !studentName ||
    !school
  ) {
    return res.status(400).json({
      message:
        "Please fill in all fields, ensure daily logs and week summary are recorded",
    });
  }

  try {
    db.query(
      "INSERT INTO logbooks (student_id, week_number, weekly_summary, daily_logs, department, student_name, school) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [studentId, weekNumber, weekSummary, dailyLogs, department, studentName, school]
    );
    res.status(200).json({ message: "Logbook created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//* Get all logbooks for a particular student
logBookRouter.get("/:studentId", authenticateUser, async (req, res) => {
  const { studentId } = req.params;

  try {
    const logbooks = await db.query(
      "SELECT * FROM logbooks WHERE student_id = $1",
      [studentId]
    );

    res.status(200).json({
      data: logbooks.rows,
    });
  } catch (error) {
    console.log(error);
  }
});

//* Get all logbooks for admin dashboard
logBookRouter.get(
  "/admin/logbooks",
  authenticateUser,
  isSupervisor,
  async (req, res) => {
    try {
      const logbooks = await db.query("SELECT * FROM logbooks");
      res.status(200).json({
        data: logbooks.rows,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

//* Get a single logbook by id
logBookRouter.get("/logbook/:logbookId", authenticateUser, async (req, res) => {
  const { logbookId } = req.params;

  if (!isValidUUID(logbookId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const logbook = await db.query("SELECT * FROM logbooks WHERE id = $1", [
      logbookId,
    ]);

    res.status(200).json({
      data: logbook.rows,
    });
  } catch (error) {
    console.log(error);
  }
});

//* Update a logbook. Supervisor only approves logbook
logBookRouter.put(
  "/admin/logbook/comments/:id",
  authenticateUser,
  isSupervisor,
  async (req, res) => {
    const id = req.params.id;
    const { supervisor_comments } = req.body;

    //* Whether there is supervisor comments or not, update the logbook with supervisor comments
    try {
      db.query("UPDATE logbooks SET supervisor_comments = $1 WHERE id = $2", [
        supervisor_comments,
        id,
      ]);
      res.status(200).json({ message: "Logbook updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//* Update a logbook. Update the signed by field
logBookRouter.put(
  "/admin/logbook/supervisor-phone/:id",
  authenticateUser,
  isSupervisor,
  async (req, res) => {
    const id = req.params.id;
    const { supervisor_phone } = req.body;

    //* Whether there is supervisor comments or not, update the logbook with supervisor comments
    try {
      db.query("UPDATE logbooks SET supervisor_phone = $1 WHERE id = $2", [
        supervisor_phone,
        id,
      ]);
      res.status(200).json({ message: "Logbook updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

logBookRouter.put(
  "/admin/logbook/signedby/:id",
  authenticateUser,
  isSupervisor,
  async (req, res) => {
    const id = req.params.id;
    const { signed_by } = req.body;

    //* Whether there is signed by or not, update the logbook with signed by field
    try {
      db.query("UPDATE logbooks SET signed_by = $1 WHERE id = $2", [
        signed_by,
        id,
      ]);
      res.status(200).json({ message: "Logbook updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//* Approve Logbook By Supervisor
logBookRouter.put(
  "/admin/logbook/approve/:id",
  authenticateUser,
  isSupervisor,
  async (req, res) => {
    const id = req.params.id;
    const is_approved = true;

    //* Whether there is signed by or not, update the logbook with signed by field
    try {
      db.query("UPDATE logbooks SET is_approved = $1 WHERE id = $2", [
        is_approved,
        id,
      ]);
      res.status(200).json({ message: "Logbook updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//* Delete a particular logbook by id
logBookRouter.delete("/logbook/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;
  try {
    db.query("DELETE FROM logbooks WHERE id = $1", [id]);
    res.status(200).json({ message: "Logbook deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//* Sum all logbooks for a particular student
logBookRouter.get("/total/:studentId", authenticateUser, async (req, res) => {
  const { studentId } = req.params;

  try {
    const logbooks = await db.query(
      "SELECT COUNT(*) FROM logbooks WHERE student_id = $1",
      [studentId]
    );
    res.status(200).json({
      data: logbooks.rows,
    });
  } catch (error) {
    console.log(error);
  }
});

//* Sum all logbooks for admin dashboard
logBookRouter.get(
  "/admin/logbooks/total",
  authenticateUser,
  isSupervisor,
  async (req, res) => {
    try {
      const logbooks = await db.query("SELECT COUNT(*) FROM logbooks");
      res.status(200).json({
        data: logbooks.rows,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

//* Sum all approved logbooks for a particular student
logBookRouter.get(
  "/approved/:studentId",
  authenticateUser,
  async (req, res) => {
    const { studentId } = req.params;
    try {
      const logbooks = await db.query(
        "SELECT COUNT(*) FROM logbooks WHERE student_id = $1 AND is_approved = true",
        [studentId]
      );
      res.status(200).json({
        data: logbooks.rows,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

//* Sum all approved logbooks for admin dashboard
logBookRouter.get(
  "/admin/logbooks/approved",
  authenticateUser,
  isSupervisor,
  async (req, res) => {
    try {
      const logbooks = await db.query(
        "SELECT COUNT(*) FROM logbooks WHERE is_approved = true"
      );
      res.status(200).json({
        data: logbooks.rows,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

//* Sum all unapproved logbooks for a particular student
logBookRouter.get(
  "/unapproved/:studentId",
  authenticateUser,
  async (req, res) => {
    const { studentId } = req.params;
    try {
      const logbooks = await db.query(
        "SELECT COUNT(*) FROM logbooks WHERE student_id = $1 AND is_approved = false",
        [studentId]
      );
      res.status(200).json({
        data: logbooks.rows,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

//* Sum all unapproved logbooks for admin dashboard
logBookRouter.get(
  "/admin/logbooks/unapproved",
  authenticateUser,
  isSupervisor,
  async (req, res) => {
    try {
      const logbooks = await db.query(
        "SELECT COUNT(*) FROM logbooks WHERE is_approved = false"
      );
      res.status(200).json({
        data: logbooks.rows,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

//* Generate a PDF for a particular logbook
logBookRouter.get(
  "/logbook/pdf/:logbookId",
  authenticateUser,
  async (req, res) => {
    const { logbookId } = req.params;
    // Set the content type to PDF
    res.setHeader("Content-Type", "application/pdf");
    // Set the content disposition to attachment to force download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=weekly-logs.pdf"
    );
    try {
      const logbook = await db.query("SELECT * FROM logbooks WHERE id = $1", [
        logbookId,
      ]);

      for (let i = 0; i < logbook.rows.length; i++) {
        generatePDF(logbook.rows[i], res);
      }
    } catch (error) {
      console.log(error);
    }
  }
);

logBookRouter.post("/send-email", authenticateUser, async (req, res) => {
  const { from, to, subject, text } = req.body;

  try {
    const result = await sendEmail(from, to, subject, text);
    if (result) {
      res.status(200).json({ message: "Email sent successfully!" });
    } else {
      res.status(500).json({ message: "Failed to send email." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while sending the email." });
  }
});

module.exports = logBookRouter;
