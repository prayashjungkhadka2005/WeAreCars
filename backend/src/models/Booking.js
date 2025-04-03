const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    surname: {
      type: String,
      required: [true, 'Surname is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Customer must be at least 18 years old']
    },
    drivingLicense: {
      type: String,
      required: [true, 'Driving license is required'],
      trim: true
    }
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  rentalDetails: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: [1, 'Minimum rental period is 1 day'],
      max: [28, 'Maximum rental period is 28 days']
    },
    pickupLocation: {
      type: String,
      required: true
    },
    dropoffLocation: {
      type: String,
      required: true
    },
    extras: {
      unlimitedMileage: {
        type: Boolean,
        default: false
      },
      breakdownCover: {
        type: Boolean,
        default: false
      }
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    carTypeExtra: {
      type: Number,
      default: 0
    },
    fuelTypeExtra: {
      type: Number,
      default: 0
    },
    extrasPrice: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Add index for better query performance
bookingSchema.index({ 'customer.firstName': 1, 'customer.surname': 1 });
bookingSchema.index({ car: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema); 