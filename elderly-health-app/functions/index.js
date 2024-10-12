const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true}); // CORS middleware
const sgMail = require("@sendgrid/mail");
const axios = require("axios"); // For downloading the file
const {Buffer} = require("buffer"); // Node.js Buffer for base64 conversion

// Initialize Firebase Admin SDK
admin.initializeApp();

// Firestore reference
const adminDb = admin.firestore();

// Set SendGrid API Key
// eslint-disable-next-line max-len
sgMail.setApiKey("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"); // Replace with your actual SendGrid API key

// Function to book an appointment
exports.bookAppointment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Ensure the request method is POST
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      // Parse appointment details from the request body
      const {name, email, phone, date, time, userId} = req.body;

      // Validate required fields
      if (!name || !email || !phone || !date || !time || !userId) {
        return res.status(400).send("Missing required fields");
      }

      // Create appointment data
      const appointment = {
        name,
        email,
        phone,
        date,
        time,
        userId,
        status: "Created",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store the appointment in Firestore
      await adminDb.collection("appointments").add(appointment);

      // Return a success response
      // eslint-disable-next-line max-len
      return res.status(200).send({message: "Appointment booked successfully", appointment});
    } catch (error) {
      console.error("Error booking appointment:", error);
      return res.status(500).send("Internal Server Error");
    }
  });
});

// Function to send appointment update emails
exports.sendAppointmentEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {email, subject, body, attachmentUrl, attachmentName} = req.body;

      // Validate email data
      if (!email || !subject || !body || !attachmentUrl || !attachmentName) {
        return res.status(400).send("Missing required email fields");
      }

      // Download the attachment from Firebase Storage
      const fileResponse = await axios.get(attachmentUrl, {
        responseType: "arraybuffer",
      });
      const fileContent = Buffer.from(fileResponse.data).toString("base64");

      // Prepare email details
      const msg = {
        to: email,
        // eslint-disable-next-line max-len
        from: "cyua0010@student.monash.edu", // Replace with your verified sender email
        subject,
        text: body,
        // eslint-disable-next-line max-len
        html: body.replace(/\n/g, "<br>"), // Convert newlines to HTML line breaks
        attachments: [
          {
            content: fileContent, // Base64 encoded file content
            filename: attachmentName,
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
      };

      // Send the email using SendGrid
      await sgMail.send(msg);

      // Return a success response
      // eslint-disable-next-line max-len
      return res.status(200).send({success: true, message: "Email sent successfully"});
    } catch (error) {
      console.error("Error sending email:", error);
      // eslint-disable-next-line max-len
      return (
        res
            .status(500)
        // eslint-disable-next-line max-len
            .send({success: false, message: "Failed to send email", error: error.message})
      );
    }
  });
});
