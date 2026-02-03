import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './database.js';
import { randomUUID } from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Registration Endpoint
// Registration Endpoint
app.post('/api/register', (req, res) => {
  const {
    employeeCode,
    name,
    location,
    organisation, // Note: Frontend uses 'organisation', DB uses 'organization'
    department,
    designation,
    email,
    sports,
    otherSport
  } = req.body;

  // --- Validation ---

  // 1. Required fields
  if (!employeeCode || !name || !location || !organisation || !department || !designation || !email || !sports) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 2. Employee Code: Exactly 6 numeric digits
  const employeeCodeRegex = /^\d{6}$/;
  if (!employeeCodeRegex.test(employeeCode)) {
    return res.status(400).json({ error: 'Employee code must be exactly 6 numeric digits' });
  }

  // 3. Email format (basic check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // 4. "Others" sport validation
  let finalOtherSport = null;
  if (sports.includes('Others')) {
    if (!otherSport || otherSport.trim() === '') {
      return res.status(400).json({ error: 'Please specify the other sport' });
    }
    finalOtherSport = otherSport.trim();
  }

  // --- Data Preparation ---
  // Store sports as a JSON string
  const sportsInterested = JSON.stringify(sports);

  const sql = `INSERT INTO registrations (
    employee_code,
    full_name,
    location,
    organization,
    department,
    designation,
    email,
    sports_interested,
    other_sport
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    employeeCode,
    name,
    location,
    organisation,
    department,
    designation,
    email,
    sportsInterested,
    finalOtherSport
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error inserting registration:', err.message);
      // Check for unique constraint violations
      if (err.message.includes('UNIQUE constraint failed')) {
        if (err.message.includes('employee_code')) {
          return res.status(400).json({ error: 'Employee code already registered' });
        }
        if (err.message.includes('email')) {
          return res.status(400).json({ error: 'Email already registered' });
        }
      }
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    res.json({
      message: 'Registration successful',
      data: {
        employee_code: employeeCode,
        full_name: name,
        email: email
      }
    });
  });
});

// Feedback Endpoint
app.post('/api/feedback', (req, res) => {
  const {
    name,
    email,
    employeeCode,
    contactNumber,
    location,
    organisation,
    department,
    rating,
    type,
    message
  } = req.body;

  // --- Validation ---

  // 1. Required fields: Rating, Type, Message
  if (!rating || !type || !message) {
    return res.status(400).json({ error: 'Rating, Feedback Type, and Message are required' });
  }

  // 2. Rating validation (1-5)
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // 3. Feedback Type validation
  const validTypes = ['suggestion', 'complaint', 'appreciation'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid feedback type' });
  }

  // 4. Message validation
  if (message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // 5. Optional validations
  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
  }

  if (employeeCode && employeeCode.trim() !== '') {
    const employeeCodeRegex = /^\d{6}$/;
    if (!employeeCodeRegex.test(employeeCode)) {
      return res.status(400).json({ error: 'Employee code must be exactly 6 digits' });
    }
  }

  // --- Database Insertion ---
  const sql = `INSERT INTO feedbacks (
        name,
        email,
        employee_code,
        contact_number,
        location,
        organization,
        department,
        experience_rating,
        feedback_type,
        message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    name || null,
    email || null,
    employeeCode || null,
    contactNumber || null,
    location || null,
    organisation || null,
    department || null,
    rating,
    type,
    message
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error submitting feedback:', err.message);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json({
      message: 'Feedback submitted successfully',
      data: { id: this.lastID }
    });
  });
});

// Get all registrations (optional, for verification)
app.get('/api/registrations', (req, res) => {
  const sql = "SELECT * FROM registrations";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    })
  });
});

// --- Admin Panel Logic ---

// --- Admin Panel Logic ---

// Create sessions table
db.run(`CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin@123') {
    const token = randomUUID();
    const sql = `INSERT INTO admin_sessions (token) VALUES (?)`;
    db.run(sql, [token], (err) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      return res.json({ token, message: 'Login successful' });
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const { token } = req.body;
  if (token) {
    db.run(`DELETE FROM admin_sessions WHERE token = ?`, [token], () => {
      res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.json({ message: 'Logged out successfully' });
  }
});

// Admin Protection Middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  db.get(`SELECT token FROM admin_sessions WHERE token = ?`, [token], (err, row) => {
    if (err || !row) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    next();
  });
};

// Admin Data (Protected)
app.get('/api/admin/data', authenticateAdmin, (req, res) => {
  // Logic simplified by middleware usage
  const registrationsQuery = "SELECT * FROM registrations ORDER BY created_at DESC";
  const feedbacksQuery = "SELECT * FROM feedbacks ORDER BY submitted_at DESC";

  db.all(registrationsQuery, [], (err, registrations) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.all(feedbacksQuery, [], (err, feedbacks) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        registrations,
        feedbacks
      });
    });
  });
});

// --- Calendar API ---

// Public: Get all events
app.get('/api/calendar/events', (req, res) => {
  const sql = "SELECT * FROM calendar_events ORDER BY event_date ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Admin: Add Event
app.post('/api/admin/calendar/events', authenticateAdmin, (req, res) => {
  const { event_name, sport, event_date, event_type } = req.body;

  if (!event_name || !sport || !event_date || !event_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['Internal', 'External', 'Corporate'].includes(event_type)) {
    return res.status(400).json({ error: 'Invalid event type' });
  }

  const sql = `INSERT INTO calendar_events (event_name, sport, event_date, event_type) VALUES (?, ?, ?, ?)`;
  db.run(sql, [event_name, sport, event_date, event_type], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Event added successfully', id: this.lastID });
  });
});

// Admin: Update Event
app.put('/api/admin/calendar/events/:id', authenticateAdmin, (req, res) => {
  const { event_name, sport, event_date, event_type } = req.body;
  const { id } = req.params;

  if (!event_name || !sport || !event_date || !event_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `UPDATE calendar_events SET event_name = ?, sport = ?, event_date = ?, event_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  db.run(sql, [event_name, sport, event_date, event_type, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  });
});

// Admin: Delete Event
app.delete('/api/admin/calendar/events/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM calendar_events WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

// --- What's New API ---

// Public: Get What's New
app.get('/api/whats-new', (req, res) => {
  const sql = "SELECT * FROM whats_new ORDER BY id ASC LIMIT 4";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Ensure always 4 items (though seed ensures this, good to be safe)
    res.json(rows);
  });
});

// Admin: Update What's New Item
app.put('/api/admin/whats-new/:id', authenticateAdmin, (req, res) => {
  const { title, description, icon_type } = req.body;
  const { id } = req.params;

  if (!title || !description || !icon_type) {
    return res.status(400).json({ error: 'Title, description, and icon type are required' });
  }

  const sql = `UPDATE whats_new SET title = ?, description = ?, icon_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  db.run(sql, [title, description, icon_type, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Update successful' });
  });
});

// --- Upcoming Events API ---

// Public: Get Upcoming Events (Sorted by date)
// --- Image Upload Configuration ---
// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/events';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Unique filename: timestamp-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter (JPEG/PNG only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// --- Upcoming Events API ---

// Public: Get Upcoming Events (Sorted by date)
app.get('/api/events/upcoming', (req, res) => {
  const sql = "SELECT * FROM upcoming_events ORDER BY event_date ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Admin: Add Upcoming Event (with file upload)
app.post('/api/admin/events', authenticateAdmin, upload.single('event_image'), (req, res) => {
  const { event_name, event_date, event_time, event_venue } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  if (!event_name || !event_date || !event_time || !event_venue) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Store relative path
  const event_image = `events/${req.file.filename}`;

  const sql = `INSERT INTO upcoming_events (event_name, event_date, event_time, event_venue, event_image) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [event_name, event_date, event_time, event_venue, event_image], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Event added successfully', id: this.lastID, image: event_image });
  });
});

// Admin: Update Upcoming Event (with optional file upload)
app.put('/api/admin/events/:id', authenticateAdmin, upload.single('event_image'), (req, res) => {
  const { event_name, event_date, event_time, event_venue } = req.body;
  const { id } = req.params;

  if (!event_name || !event_date || !event_time || !event_venue) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If new file uploaded, use it. Otherwise, we assume the frontend *might* send the old image string, but here we only care if a new file is present.
  // Actually, if a file is NOT uploaded, we shouldn't overwrite the image column unless we want to keep it same.
  // SQL construction depends on whether file is present.

  let sql;
  let params;

  if (req.file) {
    const event_image = `events/${req.file.filename}`;
    sql = `UPDATE upcoming_events SET event_name = ?, event_date = ?, event_time = ?, event_venue = ?, event_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params = [event_name, event_date, event_time, event_venue, event_image, id];
  } else {
    sql = `UPDATE upcoming_events SET event_name = ?, event_date = ?, event_time = ?, event_venue = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params = [event_name, event_date, event_time, event_venue, id];
  }

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  });
});

// Admin: Delete Upcoming Event
app.delete('/api/admin/events/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  // Optional: Delete the image file from disk. For now, we skip this to avoid deleting shared images or complex logic, but it's good practice.
  // Let's keep it simple as per prompt requirements (focus is on uploading). 

  const sql = `DELETE FROM upcoming_events WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

// --- Hall of Fame API ---

// Configure Multer for Hall of Fame
const hallOfFameStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/hall_of_fame';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadHallOfFame = multer({
  storage: hallOfFameStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Public: Get Hall of Fame Entries
app.get('/api/hall-of-fame', (req, res) => {
  const sql = "SELECT * FROM hall_of_fame ORDER BY created_at DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Admin: Add Hall of Fame Entry
app.post('/api/admin/hall-of-fame', authenticateAdmin, uploadHallOfFame.single('event_image'), (req, res) => {
  const { event_name, event_date, event_venue, winner_name, achievement_type } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  if (!event_name || !event_date || !event_venue || !winner_name || !achievement_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const event_image = `hall_of_fame/${req.file.filename}`;

  const sql = `INSERT INTO hall_of_fame (event_name, event_date, event_venue, winner_name, achievement_type, event_image) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [event_name, event_date, event_venue, winner_name, achievement_type, event_image], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Entry added successfully', id: this.lastID, image: event_image });
  });
});

// Admin: Update Hall of Fame Entry
app.put('/api/admin/hall-of-fame/:id', authenticateAdmin, uploadHallOfFame.single('event_image'), (req, res) => {
  const { event_name, event_date, event_venue, winner_name, achievement_type } = req.body;
  const { id } = req.params;

  if (!event_name || !event_date || !event_venue || !winner_name || !achievement_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let sql;
  let params;

  if (req.file) {
    const event_image = `hall_of_fame/${req.file.filename}`;
    sql = `UPDATE hall_of_fame SET event_name = ?, event_date = ?, event_venue = ?, winner_name = ?, achievement_type = ?, event_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params = [event_name, event_date, event_venue, winner_name, achievement_type, event_image, id];
  } else {
    sql = `UPDATE hall_of_fame SET event_name = ?, event_date = ?, event_venue = ?, winner_name = ?, achievement_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params = [event_name, event_date, event_venue, winner_name, achievement_type, id];
  }

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry updated successfully' });
  });
});

// Admin: Delete Hall of Fame Entry
app.delete('/api/admin/hall-of-fame/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM hall_of_fame WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted successfully' });
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
