USE velora_db;

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    captain_id INT DEFAULT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    pickup_latitude DECIMAL(10, 8) NOT NULL,
    pickup_longitude DECIMAL(11, 8) NOT NULL,
    dropoff_latitude DECIMAL(10, 8) NOT NULL,
    dropoff_longitude DECIMAL(11, 8) NOT NULL,
    distance_km DECIMAL(5, 2) DEFAULT NULL,
    estimated_duration INT DEFAULT NULL, -- in minutes
    fare_amount DECIMAL(8, 2) NOT NULL,
    status ENUM('requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled') DEFAULT 'requested',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    arrived_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT NULL,
    special_instructions TEXT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Ride locations tracking
CREATE TABLE IF NOT EXISTS ride_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ride_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ride_id INT NOT NULL,
    student_id INT NOT NULL,
    captain_id INT NOT NULL,
    amount DECIMAL(8, 2) NOT NULL,
    platform_fee DECIMAL(8, 2) DEFAULT 0.00,
    captain_earnings DECIMAL(8, 2) NOT NULL,
    payment_method ENUM('wallet', 'card', 'upi', 'cash') DEFAULT 'wallet',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ride_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ride_review (ride_id, reviewer_id, reviewee_id)
);

-- Captain availability
CREATE TABLE IF NOT EXISTS captain_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    captain_id INT NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    current_latitude DECIMAL(10, 8) NULL,
    current_longitude DECIMAL(11, 8) NULL,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_captain (captain_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('ride_request', 'ride_accepted', 'ride_started', 'ride_completed', 'payment', 'general') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add wallet balance to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10, 2) DEFAULT 0.00;

-- Add captain specific fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_captain BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10, 8) NULL,
ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(11, 8) NULL,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP NULL;

-- Create indexes for better performance
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_student ON rides(student_id);
CREATE INDEX idx_rides_captain ON rides(captain_id);
CREATE INDEX idx_rides_requested_at ON rides(requested_at);
CREATE INDEX idx_payments_ride ON payments(ride_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_captain ON payments(captain_id);
CREATE INDEX idx_reviews_ride ON reviews(ride_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

SELECT 'Ride-sharing system tables created successfully!' as status;
