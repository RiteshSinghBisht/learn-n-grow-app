const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');

admin.initializeApp();

// Enable CORS for all origins
const corsHandler = cors({ origin: true });

// Firestore reference
const db = admin.firestore();

/**
 * API Endpoint: Create Announcement
 *
 * POST /announcements
 * Body: { title, message, date }
 *
 * Example curl:
 * curl -X POST https://us-central1-learn-n-grow-7ef71.cloudfunctions.net/createAnnouncement \
 *   -H "Content-Type: application/json" \
 *   -d '{"title": "Test", "message": "Hello World", "date": "2026-02-28"}'
 */
exports.createAnnouncement = functions.https.onRequest((req, res) => {
  // Handle CORS
  return corsHandler(req, res, async () => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send('');
      return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      const { title, message, date } = req.body;

      // Validate required fields
      if (!title || !message || !date) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['title', 'message', 'date'],
          received: { title, message, date }
        });
        return;
      }

      // Create announcement document
      const announcementRef = db.collection('announcements').doc();

      // Parse date - accept both string and timestamp
      let parsedDate;
      if (typeof date === 'string') {
        parsedDate = admin.firestore.Timestamp.fromDate(new Date(date));
      } else if (date.seconds) {
        // Already a timestamp object
        parsedDate = new admin.firestore.Timestamp(date.seconds, date.nanoseconds || 0);
      } else {
        parsedDate = admin.firestore.Timestamp.now();
      }

      const announcementData = {
        title: String(title).trim(),
        message: String(message).trim(),
        date: parsedDate,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        id: announcementRef.id
      };

      await announcementRef.set(announcementData);

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        id: announcementRef.id,
        data: {
          ...announcementData,
          date: parsedDate.toDate().toISOString()
        }
      });

    } catch (error) {
      console.error('Error creating announcement:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });
});

/**
 * API Endpoint: Get All Announcements
 *
 * GET /getAnnouncements
 */
exports.getAnnouncements = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed. Use GET.' });
      return;
    }

    try {
      const snapshot = await db.collection('announcements')
        .orderBy('date', 'desc')
        .get();

      const announcements = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          message: data.message,
          date: data.date ? data.date.toDate().toISOString() : null,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
        };
      });

      res.status(200).json({
        success: true,
        count: announcements.length,
        data: announcements
      });

    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });
});

/**
 * API Endpoint: Delete Announcement
 *
 * DELETE /deleteAnnouncement
 * Body: { id }
 */
exports.deleteAnnouncement = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'DELETE, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'DELETE' && req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use DELETE or POST.' });
      return;
    }

    try {
      const { id } = req.body;

      if (!id) {
        res.status(400).json({
          error: 'Missing required field: id'
        });
        return;
      }

      await db.collection('announcements').doc(id).delete();

      res.status(200).json({
        success: true,
        message: 'Announcement deleted successfully',
        id
      });

    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });
});
