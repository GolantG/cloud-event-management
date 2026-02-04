CREATE DATABASE IF NOT EXISTS eventdb;
USE eventdb;

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(100),
    max_participants INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

INSERT INTO events (title, description, date, time, location, max_participants) VALUES
('Tech Conference', 'Annual technology conference for developers', '2026-06-15', '09:00:00', 'New York Convention Center', 500),
('Docker Workshop', 'Hands-on workshop about containerization', '2026-06-20', '14:00:00', 'Online', 100),
('Startup Networking', 'Networking event for entrepreneurs', '2026-06-25', '18:30:00', 'San Francisco', 200);

INSERT INTO participants (event_id, name, email, phone) VALUES
(1, 'John Smith', 'john@example.com', '+48346456734'),
(2, 'Emma Johnson', 'emma@example.com', '+48213467432'),
(3, 'Michael Brown', 'michael@example.com', '+48593940567');