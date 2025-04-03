const Car = require('../models/Car');
const Booking = require('../models/Booking');

// @desc    Get all cars
// @route   GET /api/cars
// @access  Private (Staff only)
exports.getCars = async (req, res) => {
  try {
    const { type, fuelType, isAvailable } = req.query;
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (fuelType) query.fuelType = fuelType;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

    const cars = await Car.find(query).sort({ createdAt: -1 });
    
    // Update imageUrl to include full server URL for all cars
    const carsWithFullUrls = cars.map(car => {
      if (car.imageUrl) {
        car.imageUrl = `http://localhost:5000${car.imageUrl}`;
      }
      return car;
    });

    res.status(200).json({
      success: true,
      count: cars.length,
      data: carsWithFullUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cars',
      error: error.message
    });
  }
};

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Private (Staff only)
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching car',
      error: error.message
    });
  }
};

// @desc    Create new car
// @route   POST /api/cars
// @access  Private (Staff only)
exports.createCar = async (req, res) => {
  try {
    // Debug logs
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);
    console.log('Received car type:', req.body.type);
    console.log('Type of car type:', typeof req.body.type);
    console.log('Valid car types:', ['City car', 'Family car', 'Sports car', 'SUV']);
    console.log('Received features:', req.body.features);
    console.log('Type of features:', typeof req.body.features);

    // Validate car type and fuel type
    const validCarTypes = ['City car', 'Family car', 'Sports car', 'SUV'];
    const validFuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Full electric'];

    if (!validCarTypes.includes(req.body.type)) {
      console.log('Car type validation failed');
      console.log('Received type:', req.body.type);
      console.log('Valid types:', validCarTypes);
      return res.status(400).json({
        success: false,
        message: 'Invalid car type. Must be one of: City car, Family car, Sports car, SUV'
      });
    }

    if (!validFuelTypes.includes(req.body.fuelType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fuel type. Must be one of: Petrol, Diesel, Hybrid, Full electric'
      });
    }

    // Set base price per day based on car type
    let basePricePerDay = 25; // Default price for City car
    switch (req.body.type) {
      case 'Family car':
        basePricePerDay = 75; // £25 + £50
        break;
      case 'Sports car':
        basePricePerDay = 100; // £25 + £75
        break;
      case 'SUV':
        basePricePerDay = 90; // £25 + £65
        break;
    }

    // Add fuel type extra to base price
    switch (req.body.fuelType) {
      case 'Hybrid':
        basePricePerDay += 30;
        break;
      case 'Full electric':
        basePricePerDay += 50;
        break;
    }

    // Create car data object
    const carData = {
      ...req.body,
      pricePerDay: basePricePerDay,
      isAvailable: true,
      rentalHistory: [],
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      features: Array.isArray(req.body.features) ? req.body.features : JSON.parse(req.body.features),
      seats: parseInt(req.body.seats),
      luggageCapacity: parseInt(req.body.luggageCapacity),
      mileage: parseInt(req.body.mileage),
      lastMaintenance: new Date(req.body.lastMaintenance)
    };

    console.log('Processed features:', carData.features);
    console.log('Type of processed features:', typeof carData.features);
    console.log('Is features an array?', Array.isArray(carData.features));

    // Create the car
    const car = await Car.create(carData);
    
    // Update the imageUrl to include the full server URL
    if (car.imageUrl) {
      car.imageUrl = `http://localhost:5000${car.imageUrl}`;
    }

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car
    });
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating car',
      error: error.message
    });
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private (Staff only)
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // If updating car type or fuel type, recalculate price
    if (req.body.type || req.body.fuelType) {
      let basePricePerDay = 25; // Default price for City car
      
      // Calculate new base price based on car type
      switch (req.body.type || car.type) {
        case 'Family car':
          basePricePerDay = 75;
          break;
        case 'Sports car':
          basePricePerDay = 100;
          break;
        case 'SUV':
          basePricePerDay = 90;
          break;
      }

      // Add fuel type extra
      switch (req.body.fuelType || car.fuelType) {
        case 'Hybrid':
          basePricePerDay += 30;
          break;
        case 'Full electric':
          basePricePerDay += 50;
          break;
      }

      req.body.pricePerDay = basePricePerDay;
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: updatedCar
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating car',
      error: error.message
    });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private (Staff only)
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for active bookings
    const activeBookings = await Booking.find({
      car: id,
      status: { $in: ['active', 'pending'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete car with active or pending bookings'
      });
    }

    const car = await Car.findByIdAndDelete(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.json({
      success: true,
      message: 'Car deleted successfully',
      data: car
    });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete car'
    });
  }
};

// Check car availability
exports.checkCarAvailability = async (req, res) => {
  try {
    const { startDate, endDate, carType, fuelType } = req.query;

    // Build query
    const query = {
      isAvailable: true
    };

    // Add filters if provided
    if (carType) query.type = carType;
    if (fuelType) query.fuelType = fuelType;

    // Get all cars matching the criteria
    const cars = await Car.find(query);

    // If dates are provided, check booking conflicts
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Get all bookings in the date range
      const bookings = await Booking.find({
        'rentalDetails.startDate': { $lte: end },
        'rentalDetails.endDate': { $gte: start }
      });

      // Create a set of booked car IDs
      const bookedCarIds = new Set(bookings.map(booking => booking.car.toString()));

      // Filter out booked cars
      const availableCars = cars.filter(car => !bookedCarIds.has(car._id.toString()));

      res.status(200).json({
        success: true,
        count: availableCars.length,
        data: availableCars
      });
    } else {
      // If no dates provided, return all matching cars
      res.status(200).json({
        success: true,
        count: cars.length,
        data: cars
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking car availability',
      error: error.message
    });
  }
};

// Get car rental history
exports.getCarRentalHistory = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('rentalHistory.bookingId', 'customer.firstName customer.surname rentalDetails.startDate rentalDetails.endDate');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        car: {
          brand: car.brand,
          model: car.model,
          type: car.type
        },
        rentalHistory: car.rentalHistory,
        totalRentalDays: car.totalRentalDays
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching car rental history',
      error: error.message
    });
  }
};

// Update car availability
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    // If trying to make car unavailable, check for active bookings
    if (!isAvailable) {
      const activeBookings = await Booking.find({
        car: id,
        status: { $in: ['active', 'pending'] }
      });

      if (activeBookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot make car unavailable with active or pending bookings'
        });
      }
    }

    const car = await Car.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.json({
      success: true,
      message: `Car ${isAvailable ? 'marked as available' : 'marked as unavailable'}`,
      data: car
    });
  } catch (error) {
    console.error('Error updating car availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update car availability'
    });
  }
};
