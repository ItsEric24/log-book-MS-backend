const { underline } = require("pdfkit");
const PDFDocument = require("pdfkit-table");

/**
 * Capitalizes the first letter of a string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Function to generate PDF with proper table formatting
 */
function generatePDF(data, output) {
  // Create a PDF document
  const doc = new PDFDocument({ margin: 30, size: "A4" });

  // Pipe the PDF to a file
  doc.pipe(output);

  // Add a title
  doc.fontSize(20).text("Weekly Report", { align: "center" });
  doc.moveDown();

  // Add student information
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Student ID: ", { continued: true })
    .font("Helvetica")
    .text(`${data.student_id}`);
  doc.moveDown(0.5);
  doc
    .font("Helvetica-Bold")
    .text("Name: ", { continued: true })
    .font("Helvetica")
    .text(`${data.student_name}`);
  doc.moveDown(0.5);
  doc
    .font("Helvetica-Bold")
    .text("Week Number: ", { continued: true })
    .font("Helvetica")
    .text(`${data.week_number}`);
  doc.moveDown(0.5);
  doc
    .font("Helvetica-Bold")
    .text("Department: ", { continued: true })
    .font("Helvetica")
    .text(`${capitalizeFirstLetter(data.department)}`);
  doc.moveDown(0.5);
  doc
    .font("Helvetica-Bold")
    .text("Submission Date: ", { continued: true })
    .font("Helvetica")
    .text(`${new Date(data.date).toDateString()}`);
  doc.moveDown();

  // Add weekly summary
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Weekly Summary:", { underline: true })
    .moveDown(0.5);
  doc.fontSize(12).font("Helvetica").text(data.weekly_summary, { width: 550 });
  doc.moveDown();

  // Add daily logs table
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Daily Logs:", { underline: true });
  doc.moveDown();

  // Prepare table data
  const tableData = {
    headers: [
      { label: "Day", width: 60, headerColor: "blue", headerAlign: "center" },
      { label: "Date", width: 90, headerColor: "blue", headerAlign: "center" },
      { label: "Skills Learnt", width: 180, headerColor: "blue", headerAlign: "center" },
      { label: "Description of Work", width: 203, headerColor: "blue", headerAlign: "center" },
    ],
    rows: data.daily_logs.map((log) => [
      log.day,
      new Date(log.date).toLocaleDateString(),
      log.skills_learnt, // Just plain text
      log.description_of_work, // Just plain text
    ]),
  };

  // Add the table to the PDF
  doc.table(tableData, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font("Helvetica").fontSize(10);
      rectRow.height = 50; // Ensuring row height is sufficient for text wrapping
    },
    columnSpacing: 10,
  });

  doc.moveDown();

  // Add a footer
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Supervisor Comments:", { underline: true})
    .moveDown(0.5);
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(data.supervisor_comments || "No comments yet.", {
      width: 500,
      align: "justify",
    });
  doc.moveDown();

  // Add a signature
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Signed By:", { underline: true})
    .moveDown(0.5);
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(data.signed_by || "Not signed yet.");

  // Finalize the PDF
  doc.end();

  console.log(`PDF generated successfully`);
}

module.exports = generatePDF;
