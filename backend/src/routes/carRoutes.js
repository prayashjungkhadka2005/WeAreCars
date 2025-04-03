const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  checkCarAvailability,
  getCarRentalHistory,
  updateAvailability
} = require('../controllers/carController');

// All routes are protected (staff-only)
router.use(protect);

// Car management routes
router.get('/', getCars);
router.get('/:id', getCarById);
router.get('/:id/rental-history', getCarRentalHistory);
router.get('/check-availability', checkCarAvailability);

// Use multer for file upload in create and update routes
router.post('/', upload.single('image'), createCar);
router.put('/:id', upload.single('image'), updateCar);
router.delete('/:id', deleteCar);

router.route('/:id/availability')
  .put(protect, updateAvailability);

module.exports = router;
