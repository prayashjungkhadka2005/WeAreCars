const Booking = require('../models/Booking');
const Car = require('../models/Car');

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car', 'brand model type fuelType pricePerDay');
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Get single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'brand model type fuelType pricePerDay');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    // Get car details to calculate pricing
    const car = await Car.findById(req.body.car);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Selected car not found. Please choose a different car.'
      });
    }

    if (!car.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected car is not available for booking.'
      });
    }

    // Calculate pricing
    const numberOfDays = req.body.rentalDetails.numberOfDays;
    const basePrice = 25 * numberOfDays; // £25 per day base rate
    
    // Calculate car type extra
    let carTypeExtra = 0;
    switch (car.type) {
      case 'Family car':
        carTypeExtra = 50;
        break;
      case 'Sports car':
        carTypeExtra = 75;
        break;
      case 'SUV':
        carTypeExtra = 65;
        break;
      default: // City car
        carTypeExtra = 0;
    }
    
    // Calculate fuel type extra
    let fuelTypeExtra = 0;
    switch (car.fuelType) {
      case 'Hybrid':
        fuelTypeExtra = 30;
        break;
      case 'Full electric':
        fuelTypeExtra = 50;
        break;
      default: // Petrol or Diesel
        fuelTypeExtra = 0;
    }
    
    // Calculate extras price
    const extrasPrice = calculateExtrasPrice(req.body.rentalDetails.extras, numberOfDays);
    
    // Calculate total price and deposit (20% of total)
    const totalPrice = basePrice + carTypeExtra + fuelTypeExtra + extrasPrice;
    const deposit = totalPrice * 0.2;

    // Create booking with calculated prices
    const booking = await Booking.create({
      ...req.body,
      pricing: {
        basePrice,
        carTypeExtra,
        fuelTypeExtra,
        extrasPrice,
        totalPrice,
        deposit
      }
    });

    // Update car availability
    await Car.findByIdAndUpdate(car._id, { isAvailable: false });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. A deposit of £' + deposit.toFixed(2) + ' is required.',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create booking. Please check your input and try again.',
      error: error.message
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If status is being updated to completed, make car available again
    if (req.body.status === 'completed' && booking.status !== 'completed') {
      await Car.findByIdAndUpdate(booking.car, { isAvailable: true });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found. Please check the booking ID and try again.'
      });
    }

    // Check if booking can be deleted
    if (booking.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active booking. Please cancel the booking first.'
      });
    }

    // Make car available again if booking is deleted
    await Car.findByIdAndUpdate(booking.car, { isAvailable: true });
    
    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully. Car has been marked as available.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking. Please try again later.',
      error: error.message
    });
  }
};

// Helper function to calculate extras price
const calculateExtrasPrice = (extras, numberOfDays) => {
  let extrasPrice = 0;
  
  if (extras.unlimitedMileage) {
    extrasPrice += 10 * numberOfDays; // £10 per day
  }
  if (extras.breakdownCover) {
    extrasPrice += 2 * numberOfDays; // £2 per day
  }
  
  return extrasPrice;
};

// Get booking statistics
exports.getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$pricing.totalPrice" },
          averageBookingDuration: { $avg: "$rentalDetails.numberOfDays" },
          carTypeStats: {
            $push: {
              carType: "$car.type",
              count: 1,
              revenue: "$pricing.totalPrice"
            }
          },
          statusStats: {
            $push: {
              status: "$status",
              count: 1
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalBookings: 1,
          totalRevenue: 1,
          averageBookingDuration: { $round: ["$averageBookingDuration", 1] },
          carTypeStats: {
            $reduce: {
              input: "$carTypeStats",
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  [{
                    carType: "$$this.carType",
                    count: "$$this.count",
                    revenue: "$$this.revenue"
                  }]
                ]
              }
            }
          },
          statusStats: {
            $reduce: {
              input: "$statusStats",
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  [{
                    status: "$$this.status",
                    count: "$$this.count"
                  }]
                ]
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingDuration: 0,
        carTypeStats: [],
        statusStats: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics',
      error: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found. Please check the booking ID and try again.'
      });
    }

    // If trying to cancel a booking that was paid
    if (status === 'cancelled' && booking.paymentStatus === 'paid') {
      // Update payment status to refunded
      booking.paymentStatus = 'refunded';
    }

    // Update booking status
    booking.status = status;

    // Update car availability based on status
    const car = await Car.findById(booking.car);
    if (car) {
      if (status === 'cancelled' || status === 'completed') {
        car.isAvailable = true;
      } else if (status === 'active') {
        car.isAvailable = false;
      }
      await car.save();
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to ${status} successfully. ${
        status === 'cancelled' && booking.paymentStatus === 'refunded' 
          ? 'Payment has been marked as refunded.' 
          : ''
      }`,
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status. Please try again later.',
      error: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found. Please check the booking ID and try again.'
      });
    }

    // Validate payment status transition
    if (paymentStatus === 'refunded' && booking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund payment for a booking that is not cancelled.'
      });
    }

    if (paymentStatus === 'paid' && booking.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be marked as paid for pending bookings.'
      });
    }

    // Update payment status
    booking.paymentStatus = paymentStatus;

    // If payment is marked as paid, update booking status to active
    if (paymentStatus === 'paid') {
      booking.status = 'active';
      
      // Update car availability
      const car = await Car.findById(booking.car);
      if (car) {
        car.isAvailable = false;
        await car.save();
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: `Payment status updated to ${paymentStatus} successfully. ${
        paymentStatus === 'paid' ? 'Booking status has been set to active.' : ''
      }`,
      data: booking
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status. Please try again later.',
      error: error.message
    });
  }
};
 