const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getBookings,
  getBookingById,
  createBooking,
  deleteBooking,
  updateBookingStatus,
  updatePaymentStatus
} = require('../controllers/bookingController');

// All routes are protected (staff-only)
router.use(protect);

// Booking management routes
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.delete('/:id', deleteBooking);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/payment-status', updatePaymentStatus);

module.exports = router; 