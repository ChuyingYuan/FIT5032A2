const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true}); // Import and configure CORS

// Initialize Firebase Admin SDK
admin.initializeApp();

// Firestore reference
const adminDb = admin.firestore();

exports.bookAppointment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Use CORS middleware
    try {
      // Check if the request method is POST
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      // Parse the request body for appointment details
      const {name, email, phone, date, time, userId} = req.body;

      if (!name || !email || !phone || !date || !time || !userId) {
        return res.status(400).send("Missing required fields");
      }

      // Create appointment data with unique ID
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

      // Store the appointment in Firestore (or another database)
      await adminDb.collection("appointments").add(appointment);

      // eslint-disable-next-line max-len
      return res.status(200).send({message: "Appointment booked successfully", appointment});
    } catch (error) {
      console.error("Error booking appointment:", error);
      return res.status(500).send("Internal Server Error");
    }
  });
});
