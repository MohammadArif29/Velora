const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');

// Create a new ride request
router.post('/api/rides/request', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            pickup_location,
            dropoff_location,
            pickup_latitude,
            pickup_longitude,
            dropoff_latitude,
            dropoff_longitude,
            special_instructions
        } = req.body;

        // Validate required fields
        if (!pickup_location || !dropoff_location || !pickup_latitude || !pickup_longitude || 
            !dropoff_latitude || !dropoff_longitude) {
            return res.status(400).json({
                success: false,
                message: 'All location fields are required'
            });
        }

        // Calculate distance and fare
        const distance = Ride.calculateDistance(
            parseFloat(pickup_latitude),
            parseFloat(pickup_longitude),
            parseFloat(dropoff_latitude),
            parseFloat(dropoff_longitude)
        );

        const fare = Ride.calculateFare(distance);
        const estimatedDuration = Math.round(distance * 2); // Rough estimate: 2 minutes per km

        const rideData = {
            student_id: userId,
            pickup_location,
            dropoff_location,
            pickup_latitude: parseFloat(pickup_latitude),
            pickup_longitude: parseFloat(pickup_longitude),
            dropoff_latitude: parseFloat(dropoff_latitude),
            dropoff_longitude: parseFloat(dropoff_longitude),
            distance_km: distance,
            estimated_duration: estimatedDuration,
            fare_amount: fare,
            special_instructions
        };

        const result = await Ride.createRide(rideData);

        if (result.success) {
            // Get available captains
            const availableCaptains = await Ride.getAvailableCaptains(
                parseFloat(pickup_latitude),
                parseFloat(pickup_longitude)
            );

            res.json({
                success: true,
                rideId: result.rideId,
                message: 'Ride request created successfully',
                fare: fare,
                distance: distance,
                estimatedDuration: estimatedDuration,
                availableCaptains: availableCaptains.length
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error creating ride request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get available rides for captains
router.get('/api/rides/available', requireAuth, async (req, res) => {
    try {
        const rides = await Ride.getPendingRides();
        res.json({
            success: true,
            rides: rides
        });
    } catch (error) {
        console.error('Error getting available rides:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Accept a ride
router.post('/api/rides/:rideId/accept', requireAuth, async (req, res) => {
    try {
        const { rideId } = req.params;
        const captainId = req.user.id;

        const result = await Ride.acceptRide(rideId, captainId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error accepting ride:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update ride status
router.put('/api/rides/:rideId/status', requireAuth, async (req, res) => {
    try {
        const { rideId } = req.params;
        const { status, cancellation_reason } = req.body;
        const userId = req.user.id;

        // Verify user has permission to update this ride
        const ride = await Ride.getRideById(rideId);
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        if (ride.student_id !== userId && ride.captain_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this ride'
            });
        }

        const result = await Ride.updateRideStatus(rideId, status, { cancellation_reason });

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating ride status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get ride details
router.get('/api/rides/:rideId', requireAuth, async (req, res) => {
    try {
        const { rideId } = req.params;
        const userId = req.user.id;

        const ride = await Ride.getRideById(rideId);

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Verify user has permission to view this ride
        if (ride.student_id !== userId && ride.captain_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this ride'
            });
        }

        res.json({
            success: true,
            ride: ride
        });
    } catch (error) {
        console.error('Error getting ride details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get user's ride history
router.get('/api/rides/history', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.query.type || 'student'; // 'student' or 'captain'
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const rides = await Ride.getUserRides(userId, userType, limit, offset);

        res.json({
            success: true,
            rides: rides
        });
    } catch (error) {
        console.error('Error getting ride history:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update captain location
router.post('/api/rides/location', requireAuth, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const captainId = req.user.id;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const result = await Ride.updateCaptainLocation(captainId, latitude, longitude);

        if (result.success) {
            res.json({
                success: true,
                message: 'Location updated successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to update location'
            });
        }
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Set captain online/offline status
router.post('/api/rides/status', requireAuth, async (req, res) => {
    try {
        const { isOnline } = req.body;
        const captainId = req.user.id;

        const result = await Ride.setCaptainStatus(captainId, isOnline);

        if (result.success) {
            res.json({
                success: true,
                message: `Captain status updated to ${isOnline ? 'online' : 'offline'}`
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to update captain status'
            });
        }
    } catch (error) {
        console.error('Error updating captain status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Calculate fare
router.post('/api/rides/calculate-fare', async (req, res) => {
    try {
        const { pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude } = req.body;

        if (!pickup_latitude || !pickup_longitude || !dropoff_latitude || !dropoff_longitude) {
            return res.status(400).json({
                success: false,
                message: 'All coordinates are required'
            });
        }

        const distance = Ride.calculateDistance(
            parseFloat(pickup_latitude),
            parseFloat(pickup_longitude),
            parseFloat(dropoff_latitude),
            parseFloat(dropoff_longitude)
        );

        const fare = Ride.calculateFare(distance);
        const estimatedDuration = Math.round(distance * 2);

        res.json({
            success: true,
            distance: distance,
            fare: fare,
            estimatedDuration: estimatedDuration
        });
    } catch (error) {
        console.error('Error calculating fare:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
