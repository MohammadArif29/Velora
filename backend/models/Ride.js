const { execute } = require('../config/database');

class Ride {
    // Create a new ride request
    static async createRide(rideData) {
        try {
            const {
                student_id,
                pickup_location,
                dropoff_location,
                pickup_latitude,
                pickup_longitude,
                dropoff_latitude,
                dropoff_longitude,
                distance_km,
                estimated_duration,
                fare_amount,
                special_instructions
            } = rideData;

            const query = `
                INSERT INTO rides (
                    student_id, pickup_location, dropoff_location,
                    pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude,
                    distance_km, estimated_duration, fare_amount, special_instructions
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await execute(query, [
                student_id, pickup_location, dropoff_location,
                pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude,
                distance_km, estimated_duration, fare_amount, special_instructions
            ]);

            return {
                success: true,
                rideId: result.insertId,
                message: 'Ride request created successfully'
            };
        } catch (error) {
            console.error('Error creating ride:', error);
            return {
                success: false,
                message: 'Failed to create ride request'
            };
        }
    }

    // Get available captains near pickup location
    static async getAvailableCaptains(pickupLat, pickupLng, radiusKm = 5) {
        try {
            const query = `
                SELECT 
                    u.id, u.username, u.email, u.phone,
                    cd.full_name, cd.mobile_number,
                    ca.current_latitude, ca.current_longitude,
                    ca.last_seen,
                    (6371 * acos(cos(radians(?)) * cos(radians(ca.current_latitude)) * 
                     cos(radians(ca.current_longitude) - radians(?)) + 
                     sin(radians(?)) * sin(radians(ca.current_latitude)))) AS distance
                FROM users u
                JOIN captain_details cd ON u.id = cd.user_id
                JOIN captain_availability ca ON u.id = ca.captain_id
                WHERE u.is_captain = TRUE 
                AND ca.is_online = TRUE
                AND cd.kyc_status = 'approved'
                AND ca.current_latitude IS NOT NULL
                AND ca.current_longitude IS NOT NULL
                HAVING distance <= ?
                ORDER BY distance ASC
                LIMIT 10
            `;

            const captains = await execute(query, [pickupLat, pickupLng, pickupLat, radiusKm]);
            return captains;
        } catch (error) {
            console.error('Error getting available captains:', error);
            return [];
        }
    }

    // Accept a ride request
    static async acceptRide(rideId, captainId) {
        try {
            const query = `
                UPDATE rides 
                SET captain_id = ?, status = 'accepted', accepted_at = CURRENT_TIMESTAMP
                WHERE id = ? AND status = 'requested'
            `;

            const result = await execute(query, [captainId, rideId]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Ride not found or already accepted'
                };
            }

            return {
                success: true,
                message: 'Ride accepted successfully'
            };
        } catch (error) {
            console.error('Error accepting ride:', error);
            return {
                success: false,
                message: 'Failed to accept ride'
            };
        }
    }

    // Update ride status
    static async updateRideStatus(rideId, status, additionalData = {}) {
        try {
            let query = `UPDATE rides SET status = ?`;
            let params = [status];
            let timestampField = '';

            switch (status) {
                case 'arrived':
                    timestampField = ', arrived_at = CURRENT_TIMESTAMP';
                    break;
                case 'started':
                    timestampField = ', started_at = CURRENT_TIMESTAMP';
                    break;
                case 'completed':
                    timestampField = ', completed_at = CURRENT_TIMESTAMP';
                    break;
                case 'cancelled':
                    timestampField = ', cancelled_at = CURRENT_TIMESTAMP';
                    if (additionalData.cancellation_reason) {
                        query += ', cancellation_reason = ?';
                        params.push(additionalData.cancellation_reason);
                    }
                    break;
            }

            query += timestampField + ' WHERE id = ?';
            params.push(rideId);

            const result = await execute(query, params);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Ride not found'
                };
            }

            return {
                success: true,
                message: 'Ride status updated successfully'
            };
        } catch (error) {
            console.error('Error updating ride status:', error);
            return {
                success: false,
                message: 'Failed to update ride status'
            };
        }
    }

    // Get ride details
    static async getRideById(rideId) {
        try {
            const query = `
                SELECT 
                    r.*,
                    s.username as student_username, s.email as student_email, s.phone as student_phone,
                    c.username as captain_username, c.email as captain_email, c.phone as captain_phone,
                    cd.full_name as captain_name, cd.mobile_number as captain_mobile
                FROM rides r
                LEFT JOIN users s ON r.student_id = s.id
                LEFT JOIN users c ON r.captain_id = c.id
                LEFT JOIN captain_details cd ON c.id = cd.user_id
                WHERE r.id = ?
            `;

            const rides = await execute(query, [rideId]);
            return rides[0] || null;
        } catch (error) {
            console.error('Error getting ride details:', error);
            return null;
        }
    }

    // Get user's ride history
    static async getUserRides(userId, userType = 'student', limit = 20, offset = 0) {
        try {
            const whereClause = userType === 'student' ? 'r.student_id = ?' : 'r.captain_id = ?';
            
            const query = `
                SELECT 
                    r.*,
                    s.username as student_username, s.email as student_email,
                    c.username as captain_username, c.email as captain_email,
                    cd.full_name as captain_name, cd.mobile_number as captain_mobile
                FROM rides r
                LEFT JOIN users s ON r.student_id = s.id
                LEFT JOIN users c ON r.captain_id = c.id
                LEFT JOIN captain_details cd ON c.id = cd.user_id
                WHERE ${whereClause}
                ORDER BY r.requested_at DESC
                LIMIT ? OFFSET ?
            `;

            const rides = await execute(query, [userId, limit, offset]);
            return rides;
        } catch (error) {
            console.error('Error getting user rides:', error);
            return [];
        }
    }

    // Get pending rides for captains
    static async getPendingRides() {
        try {
            const query = `
                SELECT 
                    r.*,
                    s.username as student_username, s.email as student_email, s.phone as student_phone
                FROM rides r
                JOIN users s ON r.student_id = s.id
                WHERE r.status = 'requested'
                ORDER BY r.requested_at ASC
            `;

            const rides = await execute(query);
            return rides;
        } catch (error) {
            console.error('Error getting pending rides:', error);
            return [];
        }
    }

    // Update captain location
    static async updateCaptainLocation(captainId, latitude, longitude) {
        try {
            const query = `
                INSERT INTO captain_availability (captain_id, current_latitude, current_longitude, is_online, last_seen)
                VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)
                ON DUPLICATE KEY UPDATE
                current_latitude = VALUES(current_latitude),
                current_longitude = VALUES(current_longitude),
                is_online = TRUE,
                last_seen = CURRENT_TIMESTAMP
            `;

            await execute(query, [captainId, latitude, longitude]);
            return { success: true };
        } catch (error) {
            console.error('Error updating captain location:', error);
            return { success: false };
        }
    }

    // Set captain online/offline status
    static async setCaptainStatus(captainId, isOnline) {
        try {
            const query = `
                INSERT INTO captain_availability (captain_id, is_online, last_seen)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON DUPLICATE KEY UPDATE
                is_online = VALUES(is_online),
                last_seen = CURRENT_TIMESTAMP
            `;

            await execute(query, [captainId, isOnline]);
            return { success: true };
        } catch (error) {
            console.error('Error setting captain status:', error);
            return { success: false };
        }
    }

    // Calculate fare based on distance
    static calculateFare(distanceKm, baseFare = 25, perKmRate = 12) {
        const fare = baseFare + (distanceKm * perKmRate);
        return Math.round(fare * 100) / 100; // Round to 2 decimal places
    }

    // Calculate distance between two coordinates (Haversine formula)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}

module.exports = Ride;
