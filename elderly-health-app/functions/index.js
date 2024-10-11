// functions/index.js
const functions = require('firebase-function')
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
admin.initializeApp()

const { v4: uuidv4 } = require('uuid')

// Firestore reference
const adminDb = admin.firestore()

exports.bookAppointment = functions.https.onRequest(async (req, res) => {
  try {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed')
    }

    // Parse the request body for appointment details
    const { name, email, phone, date, time } = req.body

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).send('Missing required fields')
    }

    // Create appointment data with unique ID
    const appointment = {
      id: uuidv4(), // Generate unique appointment ID
      name,
      email,
      phone,
      date,
      time,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }

    // Store the appointment in Firestore (or another database)
    await adminDb.collection('appointments').add(appointment)

    return res.status(200).send({ message: 'Appointment booked successfully', appointment })
  } catch (error) {
    console.error('Error booking appointment:', error)
    return res.status(500).send('Internal Server Error')
  }
})
