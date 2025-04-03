const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Car type is required'],
    enum: ['City car', 'Family car', 'Sports car', 'SUV'],
    default: 'City car'
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Petrol', 'Diesel', 'Hybrid', 'Full electric'],
    default: 'Petrol'
  },
  transmission: {
    type: String,
    required: [true, 'Transmission type is required'],
    enum: ['Manual', 'Automatic'],
    default: 'Manual'
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'Car must have at least 1 seat'],
    max: [8, 'Car cannot have more than 8 seats']
  },
  luggageCapacity: {
    type: Number,
    required: [true, 'Luggage capacity is required'],
    min: [0, 'Luggage capacity cannot be negative']
  },
  imageUrl: {
    type: String,
    required: [true, 'Car image URL is required']
  },
  description: {
    type: String,
    required: [true, 'Car description is required']
  },
  features: [{
    type: String,
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [0, 'Price cannot be negative']
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  lastMaintenance: {
    type: Date,
    required: [true, 'Last maintenance date is required']
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
carSchema.index({ type: 1, isAvailable: 1 });
carSchema.index({ fuelType: 1, isAvailable: 1 });

module.exports = mongoose.model('Car', carSchema); 