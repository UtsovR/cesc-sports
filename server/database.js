import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize sqlite3 with verbose mode
const verboseSqlite = sqlite3.verbose();

// Determine database path
const dbPath = path.resolve(__dirname, 'cesc_sports_club.db');

const db = new verboseSqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to the SQLite database');
        initDb();
    }
});

function initDb() {
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
        employee_code TEXT PRIMARY KEY NOT NULL,
        full_name TEXT NOT NULL,
        location TEXT NOT NULL,
        organization TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        sports_interested TEXT NOT NULL,
        other_sport TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating registrations table', err);
        } else {
            console.log('Registrations table ready');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        employee_code TEXT,
        contact_number TEXT,
        location TEXT,
        organization TEXT,
        department TEXT,
        experience_rating INTEGER NOT NULL,
        feedback_type TEXT NOT NULL,
        message TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating feedbacks table', err);
        } else {
            console.log('Feedbacks table ready');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        sport TEXT NOT NULL DEFAULT 'General',
        event_date DATE NOT NULL,
        event_type TEXT NOT NULL CHECK(event_type IN ('Internal', 'External', 'Corporate')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating calendar_events table', err);
        } else {
            console.log('Calendar events table ready');
            // Migration: Add sport column if it doesn't exist
            db.all("PRAGMA table_info(calendar_events)", (err, rows) => {
                if (!err) {
                    const hasSport = rows.some(r => r.name === 'sport');
                    if (!hasSport) {
                        console.log('Migrating: Adding sport column to calendar_events');
                        db.run("ALTER TABLE calendar_events ADD COLUMN sport TEXT NOT NULL DEFAULT 'General'", (err) => {
                            if (err) console.error("Migration failed", err);
                            else console.log("Migration successful: Added sport column");
                        });
                    }
                }
            });
            seedCalendarEvents();
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS whats_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon_type TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating whats_new table', err);
        } else {
            console.log('Whats New table ready');
            seedWhatsNew();
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS upcoming_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        event_venue TEXT NOT NULL,
        event_image TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating upcoming_events table', err);
        } else {
            console.log('Upcoming events table ready');
            seedUpcomingEvents();
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS hall_of_fame (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_venue TEXT NOT NULL,
        winner_name TEXT NOT NULL,
        achievement_type TEXT NOT NULL,
        event_image TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating hall_of_fame table', err);
        } else {
            console.log('Hall of Fame table ready');
        }
    });
}

function seedUpcomingEvents() {
    db.get("SELECT count(*) as count FROM upcoming_events", [], (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
            console.log('Seeding upcoming_events...');
            const events = [
                {
                    name: 'Annual Cricket Tournament',
                    date: 'December 15, 2025',
                    time: '9:00 AM',
                    venue: 'Main Cricket Ground',
                    image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=800'
                },
                {
                    name: 'Football League Finals',
                    date: 'December 20, 2025',
                    time: '4:00 PM',
                    venue: 'Central Stadium',
                    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800'
                },
                {
                    name: 'Badminton Championship',
                    date: 'January 5, 2026',
                    time: '10:00 AM',
                    venue: 'Indoor Sports Complex',
                    image: 'https://images.pexels.com/photos/8007401/pexels-photo-8007401.jpeg?auto=compress&cs=tinysrgb&w=800'
                }
            ];

            const insert = db.prepare(`INSERT INTO upcoming_events (event_name, event_date, event_time, event_venue, event_image) VALUES (?, ?, ?, ?, ?)`);
            events.forEach((evt) => {
                insert.run(evt.name, evt.date, evt.time, evt.venue, evt.image);
            });
            insert.finalize();
        }
    });
}

function seedCalendarEvents() {
    db.get("SELECT count(*) as count FROM calendar_events", [], (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
            // ... (existing seeding logic) ...
            console.log('Seeding calendar events...');
            const events = [
                { sport: 'Tennis', name: "Chairman's Cup", date: "2026-01-01", type: 'Internal' },
                { sport: 'Tennis', name: "Monsoon Carnival", date: "2025-09-01", type: 'Internal' },
                { sport: 'Cricket', name: "9A Side Inter Dept.", date: "2026-02-01", type: 'Internal' },
                { sport: 'Cricket', name: "Merchants Cup CCFC", date: "2025-04-01", type: 'Corporate' },
                { sport: 'Football', name: "5A Side Inter Dept.", date: "2025-04-01", type: 'Internal' },
                { sport: 'Football', name: "Merchants Cup CCFC", date: "2025-05-01", type: 'Corporate' },
                { sport: 'Table Tennis', name: "Inter Departmental", date: "2025-08-01", type: 'Internal' },
                { sport: 'Table Tennis', name: "Corp. Tourn. Saturday Club", date: "2026-01-01", type: 'Corporate' },
                { sport: 'Badminton', name: "Inter Deptartmental", date: "2025-06-01", type: 'Internal' },
                { sport: 'Badminton', name: "Lake Club Tournament", date: "2026-02-01", type: 'Corporate' },
                { sport: 'Athletics', name: "Fitness Workshop", date: "2025-10-01", type: 'Internal' },
                { sport: 'Athletics', name: "Naturopathy Workshop", date: "2026-03-01", type: 'Internal' },
                { sport: 'General', name: "Cultural/Quiz", date: "2025-10-01", type: 'Internal' },
            ];

            const insert = db.prepare(`INSERT INTO calendar_events (event_name, sport, event_date, event_type) VALUES (?, ?, ?, ?)`);
            events.forEach((evt) => {
                insert.run(evt.name, evt.sport, evt.date, evt.type === 'External Corporate Tournament' ? 'Corporate' : evt.type);
            });
            insert.finalize();
        }
    });
}

function seedWhatsNew() {
    db.get("SELECT count(*) as count FROM whats_new", [], (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
            console.log('Seeding whats_new...');
            const updates = [
                { icon: 'Bell', title: 'New Tournament Registration Open', description: 'Sign up for the Annual Inter-Division Cricket Championship' },
                { icon: 'Award', title: 'Victory in State Championship', description: 'Our badminton team secured gold at the State Level Competition' },
                { icon: 'TrendingUp', title: 'Facility Upgrade Complete', description: 'New synthetic turf installed at the main football ground' },
                { icon: 'Users', title: 'Welcome New Members', description: '50+ new members joined this month' }
            ];

            const insert = db.prepare(`INSERT INTO whats_new (title, description, icon_type) VALUES (?, ?, ?)`);
            updates.forEach((update) => {
                insert.run(update.title, update.description, update.icon);
            });
            insert.finalize();
        }
    });
}

export default db;
