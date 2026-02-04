const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || 'eventdb',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        setTimeout(() => db.connect(), 5000);
    } else {
        console.log('Connected to MySQL database');
    }
});

db.on('error', (err) => {
    console.error('Database error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        db.connect();
    }
});

app.get('/api', (req, res) => {
    res.json({
        message: 'Event Management API',
        endpoints: {
            events: '/api/events',
            participants: '/api/participants',
        }
    });
});

app.get('/api/events', (req, res) => {
    db.query(`
        SELECT e.*, 
               COUNT(p.id) as participants_count
        FROM events e
        LEFT JOIN participants p ON e.id = p.event_id
        GROUP BY e.id
        ORDER BY e.date ASC
    `, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

app.get('/api/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    
    db.query('SELECT * FROM events WHERE id = ?', [eventId], (err, eventResults) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        if (eventResults.length === 0) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        
        db.query('SELECT * FROM participants WHERE event_id = ? ORDER BY registered_at DESC', 
        [eventId], (err, participantResults) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            res.json({
                event: eventResults[0],
                participants: participantResults
            });
        });
    });
});

app.post('/api/events', (req, res) => {
    const { title, description, date, time, location, max_participants } = req.body;
    
    if (!title || !date) {
        return res.status(400).json({ error: 'Title and date are required' });
    }
    
    db.query(
        'INSERT INTO events (title, description, date, time, location, max_participants) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description || '', date, time || '18:00:00', location || '', max_participants || 100],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            db.query('SELECT * FROM events WHERE id = ?', [result.insertId], (err, eventResults) => {
                if (err) {
                    res.status(201).json({ 
                        id: result.insertId,
                        title, description, date, time, location, max_participants
                    });
                    return;
                }
                res.status(201).json(eventResults[0]);
            });
        }
    );
});

app.put('/api/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const { title, description, date, time, location, max_participants } = req.body;
    
    db.query(
        `UPDATE events 
         SET title = ?, description = ?, date = ?, time = ?, location = ?, max_participants = ?
         WHERE id = ?`,
        [title, description, date, time, location, max_participants, eventId],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            
            db.query('SELECT * FROM events WHERE id = ?', [eventId], (err, eventResults) => {
                if (err) {
                    res.json({ success: true, id: eventId });
                    return;
                }
                res.json(eventResults[0]);
            });
        }
    );
});

app.delete('/api/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    
    db.query('DELETE FROM events WHERE id = ?', [eventId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        
        res.json({ success: true, message: 'Event deleted' });
    });
});

app.get('/api/participants', (req, res) => {
    db.query(`
        SELECT p.*, e.title as event_title
        FROM participants p
        JOIN events e ON p.event_id = e.id
        ORDER BY p.registered_at DESC
    `, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

app.post('/api/participants', (req, res) => {
    const { event_id, name, email, phone } = req.body;
    
    if (!event_id || !name) {
        return res.status(400).json({ error: 'Event ID and name are required' });
    }
    
    db.query('SELECT * FROM events WHERE id = ?', [event_id], (err, eventResults) => {
        if (err || eventResults.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        db.query('SELECT COUNT(*) as count FROM participants WHERE event_id = ?', 
        [event_id], (err, countResults) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            const event = eventResults[0];
            const currentCount = countResults[0].count;
            
            if (event.max_participants && currentCount >= event.max_participants) {
                return res.status(400).json({ 
                    error: 'Event is full'
                });
            }
            
            db.query(
                'INSERT INTO participants (event_id, name, email, phone) VALUES (?, ?, ?, ?)',
                [event_id, name, email || '', phone || ''],
                (err, result) => {
                    if (err) {
                        res.status(500).json({ error: 'Database error' });
                        return;
                    }
                    
                    db.query('SELECT * FROM participants WHERE id = ?', [result.insertId], 
                    (err, participantResults) => {
                        if (err) {
                            res.status(201).json({ 
                                id: result.insertId,
                                event_id, name, email, phone
                            });
                            return;
                        }
                        
                        const participant = participantResults[0];
                        participant.event_title = event.title;
                        res.status(201).json(participant);
                    });
                }
            );
        });
    });
});

app.get('/api/stats', (req, res) => {
    db.query('SELECT COUNT(*) as total_events FROM events', (err, eventResults) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        db.query('SELECT COUNT(*) as total_participants FROM participants', (err, participantResults) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            res.json({
                events: eventResults[0].total_events,
                participants: participantResults[0].total_participants
            });
        });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});