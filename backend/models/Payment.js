const { execute } = require('../config/database');

class Payment {
    // Create a new payment record
    static async createPayment(paymentData) {
        try {
            const {
                ride_id,
                student_id,
                captain_id,
                amount,
                platform_fee = 0.00,
                payment_method = 'wallet'
            } = paymentData;

            const captain_earnings = amount - platform_fee;

            const query = `
                INSERT INTO payments (
                    ride_id, student_id, captain_id, amount, 
                    platform_fee, captain_earnings, payment_method
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await execute(query, [
                ride_id, student_id, captain_id, amount,
                platform_fee, captain_earnings, payment_method
            ]);

            return {
                success: true,
                paymentId: result.insertId,
                message: 'Payment created successfully'
            };
        } catch (error) {
            console.error('Error creating payment:', error);
            return {
                success: false,
                message: 'Failed to create payment'
            };
        }
    }

    // Process payment
    static async processPayment(paymentId, transactionId = null) {
        try {
            const query = `
                UPDATE payments 
                SET payment_status = 'completed', 
                    transaction_id = ?, 
                    completed_at = CURRENT_TIMESTAMP
                WHERE id = ? AND payment_status = 'pending'
            `;

            const result = await execute(query, [transactionId, paymentId]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Payment not found or already processed'
                };
            }

            // Update captain's wallet balance
            await this.updateCaptainEarnings(paymentId);

            return {
                success: true,
                message: 'Payment processed successfully'
            };
        } catch (error) {
            console.error('Error processing payment:', error);
            return {
                success: false,
                message: 'Failed to process payment'
            };
        }
    }

    // Update captain's earnings
    static async updateCaptainEarnings(paymentId) {
        try {
            // Get payment details
            const payments = await execute(
                'SELECT captain_id, captain_earnings FROM payments WHERE id = ?',
                [paymentId]
            );

            if (payments.length === 0) return { success: false };

            const { captain_id, captain_earnings } = payments[0];

            // Update captain's wallet balance
            await execute(
                'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
                [captain_earnings, captain_id]
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating captain earnings:', error);
            return { success: false };
        }
    }

    // Get payment details
    static async getPaymentById(paymentId) {
        try {
            const query = `
                SELECT p.*, r.pickup_location, r.dropoff_location
                FROM payments p
                JOIN rides r ON p.ride_id = r.id
                WHERE p.id = ?
            `;

            const payments = await execute(query, [paymentId]);
            return payments[0] || null;
        } catch (error) {
            console.error('Error getting payment details:', error);
            return null;
        }
    }

    // Get user's payment history
    static async getUserPayments(userId, limit = 20, offset = 0) {
        try {
            const query = `
                SELECT 
                    p.*, r.pickup_location, r.dropoff_location, r.status as ride_status,
                    s.username as student_username,
                    c.username as captain_username
                FROM payments p
                JOIN rides r ON p.ride_id = r.id
                LEFT JOIN users s ON p.student_id = s.id
                LEFT JOIN users c ON p.captain_id = c.id
                WHERE p.student_id = ? OR p.captain_id = ?
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const payments = await execute(query, [userId, userId, limit, offset]);
            return payments;
        } catch (error) {
            console.error('Error getting user payments:', error);
            return [];
        }
    }

    // Get wallet balance
    static async getWalletBalance(userId) {
        try {
            const users = await execute(
                'SELECT wallet_balance FROM users WHERE id = ?',
                [userId]
            );
            return users[0]?.wallet_balance || 0;
        } catch (error) {
            console.error('Error getting wallet balance:', error);
            return 0;
        }
    }

    // Add money to wallet
    static async addToWallet(userId, amount) {
        try {
            const query = `
                UPDATE users 
                SET wallet_balance = wallet_balance + ? 
                WHERE id = ?
            `;

            const result = await execute(query, [amount, userId]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            return {
                success: true,
                message: 'Money added to wallet successfully'
            };
        } catch (error) {
            console.error('Error adding to wallet:', error);
            return {
                success: false,
                message: 'Failed to add money to wallet'
            };
        }
    }

    // Deduct money from wallet
    static async deductFromWallet(userId, amount) {
        try {
            // Check if user has sufficient balance
            const balance = await this.getWalletBalance(userId);
            if (balance < amount) {
                return {
                    success: false,
                    message: 'Insufficient wallet balance'
                };
            }

            const query = `
                UPDATE users 
                SET wallet_balance = wallet_balance - ? 
                WHERE id = ?
            `;

            const result = await execute(query, [amount, userId]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            return {
                success: true,
                message: 'Payment deducted from wallet successfully'
            };
        } catch (error) {
            console.error('Error deducting from wallet:', error);
            return {
                success: false,
                message: 'Failed to deduct payment from wallet'
            };
        }
    }

    // Refund payment
    static async refundPayment(paymentId, reason = 'Ride cancelled') {
        try {
            // Get payment details
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                return {
                    success: false,
                    message: 'Payment not found'
                };
            }

            // Refund to student's wallet
            const refundResult = await this.addToWallet(payment.student_id, payment.amount);
            if (!refundResult.success) {
                return refundResult;
            }

            // Update payment status
            await execute(
                'UPDATE payments SET payment_status = "refunded" WHERE id = ?',
                [paymentId]
            );

            return {
                success: true,
                message: 'Payment refunded successfully'
            };
        } catch (error) {
            console.error('Error refunding payment:', error);
            return {
                success: false,
                message: 'Failed to refund payment'
            };
        }
    }

    // Get platform earnings
    static async getPlatformEarnings(startDate, endDate) {
        try {
            const query = `
                SELECT 
                    SUM(platform_fee) as total_earnings,
                    COUNT(*) as total_rides,
                    AVG(platform_fee) as avg_fee_per_ride
                FROM payments 
                WHERE payment_status = 'completed'
                AND created_at BETWEEN ? AND ?
            `;

            const result = await execute(query, [startDate, endDate]);
            return result[0];
        } catch (error) {
            console.error('Error getting platform earnings:', error);
            return null;
        }
    }
}

module.exports = Payment;
